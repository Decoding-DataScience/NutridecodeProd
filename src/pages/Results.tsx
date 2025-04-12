import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  Download,
  Info,
  Save,
  Check,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Cookie,
  ShieldAlert,
  Leaf,
  Heart,
  ChevronRight,
  Image,
  X,
  Loader2
} from 'lucide-react';
import type { AnalysisResult } from '../services/openai';
import type { PreferenceBasedAnalysis } from '../services/analysis';
import { saveAnalysis } from '../services/supabase';
import { analyzeWithPreferences, getDetailedIngredientAnalysis } from '../services/analysis';
import { getUserPreferences } from '../services/preferences';
import type { UserPreferences } from '../services/preferences';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '../components/Header';
import VoiceoverButton from '../components/VoiceoverButton';
import AnalysisVoiceover from '../components/AnalysisVoiceover';
import TextChatButton from '../components/TextChatButton';
import VoiceChatButton from '../components/VoiceChatButton';
import { analyzeIngredientWithAI, analyzeNutrientWithAI } from '../services/openai';

interface Alert {
  type: 'warning' | 'danger';
  message: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [ingredientDetails, setIngredientDetails] = useState<string | null>(null);
  const [isLoadingIngredient, setIsLoadingIngredient] = useState(false);
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [ingredientAnalysis, setIngredientAnalysis] = useState<Record<string, {
    category: string;
    explanation: string;
  }>>({});
  const [nutrientAnalysis, setNutrientAnalysis] = useState<Record<string, {
    category: string;
    explanation: string;
  }>>({});
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (!location.state?.analysis || !location.state?.imageUrl) {
      navigate('/scan');
      return;
    }

    setImageUrl(location.state.imageUrl);
    
    const enhanceAnalysis = async () => {
      try {
        setIsLoading(true);
        const preferences = await getUserPreferences();
        const enhancedAnalysis = await analyzeWithPreferences(location.state.analysis, preferences || undefined);
        setAnalysis(enhancedAnalysis);

        // Analyze ingredients with AI
        const ingredientResults: Record<string, { category: string; explanation: string }> = {};
        for (const ingredient of enhancedAnalysis.ingredients.list) {
          const result = await analyzeIngredientWithAI(ingredient, preferences || {});
          ingredientResults[ingredient] = result;
        }
        setIngredientAnalysis(ingredientResults);

        // Analyze nutrients with AI
        const nutrientResults: Record<string, { category: string; explanation: string }> = {};
        for (const [nutrient, value] of Object.entries(enhancedAnalysis.nutritionalInfo.perServing)) {
          const numericValue = typeof value === 'object' ? value.total : value;
          const result = await analyzeNutrientWithAI(nutrient, numericValue, preferences || {});
          nutrientResults[nutrient] = result;
        }
        setNutrientAnalysis(nutrientResults);
      } catch (error) {
        console.error('Error enhancing analysis:', error);
        setAnalysis(location.state.analysis as AnalysisResult);
      } finally {
        setIsLoading(false);
      }
    };

    enhanceAnalysis();
  }, [location.state, navigate]);

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const preferences = await getUserPreferences();
        setUserPreferences(preferences);
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  const handleSave = async () => {
    if (!analysis || !imageUrl) {
      setSaveError('Missing analysis data');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveAnalysis(analysis, imageUrl);
      setIsSaved(true);
      setShowSaveDialog(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving analysis:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadAsPDF = async () => {
    try {
      const element = document.getElementById('results-content');
      if (!element) {
        console.error('Results content element not found');
        return;
      }

      // Set temporary styles for better PDF capture
      const originalStyles = element.style.cssText;
      element.style.width = '1024px';
      element.style.margin = '0';
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';

      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      };

      const canvas = await html2canvas(element, options);

      // Reset original styles
      element.style.cssText = originalStyles;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${analysis?.productName || 'food'}-analysis.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const downloadAsImage = async () => {
    try {
      const element = document.getElementById('results-content');
      if (!element) {
        console.error('Results content element not found');
        return;
      }

      // Set temporary styles for better image capture
      const originalStyles = element.style.cssText;
      element.style.width = '1024px';
      element.style.margin = '0';
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';

      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      };

      const canvas = await html2canvas(element, options);

      // Reset original styles
      element.style.cssText = originalStyles;

      // Create download link
      const link = document.createElement('a');
      link.download = `${analysis?.productName || 'food'}-analysis.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const handleIngredientClick = async (ingredient: string) => {
    setSelectedIngredient(ingredient);
    setIngredientDetails(null);
    setIngredientError(null);
    setIsLoadingIngredient(true);

    try {
      const details = await getDetailedIngredientAnalysis(ingredient, userPreferences);
      setIngredientDetails(details);
    } catch (error) {
      console.error('Error getting ingredient details:', error);
      setIngredientError(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch ingredient details. Please try again.'
      );
    } finally {
      setIsLoadingIngredient(false);
    }
  };

  if (!analysis) return null;

  const calculateHealthScore = () => {
    let score = 65; // Start with base score of 6.5/10 * 100

    // Analyze fat content and type
    if (analysis.ingredients.list.some(i => i.toLowerCase().includes('rapeseed oil'))) {
      score += 15; // Healthy unsaturated fats
    }

    // Check for preservatives
    if (analysis.ingredients.preservatives.length > 0) {
      score -= 10; // Penalty for synthetic preservatives like EDTA
    }

    // Check for high calorie content
    if (analysis.nutritionalInfo.perServing.calories > 100) {
      score -= 10;
    }

    // Add points for eco-friendly packaging
    if (analysis.packaging.sustainabilityClaims.some(claim => 
      claim.toLowerCase().includes('recycled') || 
      claim.toLowerCase().includes('sustainable'))) {
      score += 10;
    }

    // Add points for certifications (vegetarian, etc.)
    if (analysis.packaging.certifications.length > 0) {
      score += 5;
    }

    // Add points for omega-3 content
    if (analysis.healthClaims.some(claim => 
      claim.toLowerCase().includes('omega'))) {
      score += 5;
    }

    // Deduct points for sugar and salt content
    if (analysis.nutritionalInfo.perServing.sugar > 0) {
      score -= 5;
    }

    // Ensure score stays within 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateHealthScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const scoreColor = getScoreColor(healthScore);

  const getIngredientTextStyle = (ingredient: string, preferences?: UserPreferences) => {
    if (!preferences) return {};

    const isAllergen = preferences.allergen_alerts?.includes(ingredient.toLowerCase());
    const isDietaryRestriction = preferences.dietary_restrictions?.includes(ingredient.toLowerCase());
    const isHealthGoal = preferences.health_goals?.includes(ingredient.toLowerCase());

    if (isAllergen) {
      return { color: 'red', fontWeight: 'bold' };
    } else if (isDietaryRestriction) {
      return { color: 'orange', fontWeight: 'bold' };
    } else if (isHealthGoal) {
      return { color: 'green', fontWeight: 'bold' };
    }
    return {};
  };

  const hasHealthGoal = (goal: string, preferences?: UserPreferences) => {
    return preferences?.health_goals?.includes(goal.toLowerCase()) ?? false;
  };

  const getIngredientStyle = async (ingredient: string, preferences?: UserPreferences) => {
    if (!preferences) return null;
    return await analyzeIngredientWithAI(ingredient, preferences);
  };

  const getNutrientStyle = async (nutrient: string, preferences?: UserPreferences) => {
    if (!preferences) return null;
    return await analyzeNutrientWithAI(nutrient, preferences);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div id="results-content">
                {/* Product Image and Health Score Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                    <img 
                      src={imageUrl} 
                      alt={analysis.productName} 
                      className="w-full h-64 object-contain mb-4"
                      crossOrigin="anonymous"
                    />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{analysis.productName}</h1>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        disabled={isSaving || isSaved}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaved ? 'Saved!' : 'Save Analysis'}
                      </button>
                      <button
                        onClick={downloadAsPDF}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Save as PDF
                      </button>
                      <button
                        onClick={downloadAsImage}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Save as Image
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Health Score</h2>
                      <div className={`text-4xl font-bold ${scoreColor}`}>
                        {healthScore}%
                      </div>
                    </div>

                    {/* Health Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Heart className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm text-green-800">Heart Healthy</span>
                      </div>
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Droplet className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">Hydration</span>
                      </div>
                      <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                        <Flame className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="text-sm text-orange-800">Calories</span>
                      </div>
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <Cookie className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-sm text-purple-800">Sugar Content</span>
                      </div>
                    </div>

                    {/* Voice Analysis */}
                    <div className="mt-6 space-y-3">
                      <AnalysisVoiceover 
                        analysis={analysis} 
                        className="w-full"
                      />
                      <VoiceChatButton className="w-full" />
                      <TextChatButton 
                        className="w-full"
                        context={analysis.productName}
                      />
                    </div>
                  </div>
                </div>

                {/* Ingredients Analysis */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Ingredients Analysis</h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <Info className="w-4 h-4 mr-1" />
                      Click ingredients for detailed analysis
                    </div>
                  </div>

                  {/* Color Coding Legend */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Color Coding Guide:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-red-100 border border-red-600 mr-2"></div>
                        <span className="text-red-600">Contains Allergens</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-orange-100 border border-orange-600 mr-2"></div>
                        <span className="text-orange-600">Dietary Restriction Conflicts</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-600 mr-2"></div>
                        <span className="text-yellow-600">Health Goal Concerns</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-600 mr-2"></div>
                        <span className="text-green-600">Healthy Ingredients</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-gray-100 border border-gray-600 mr-2"></div>
                        <span className="text-gray-900">Neutral Ingredients</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.ingredients.list.map((ingredient, index) => (
                      <button
                        key={index}
                        onClick={() => handleIngredientClick(ingredient)}
                        className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer text-left flex items-center justify-between ${getIngredientStyle(ingredient, userPreferences)}`}
                      >
                        <span className="font-medium">{ingredient}</span>
                        <Info className="w-4 h-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nutritional Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Nutritional Information</h2>
                  
                  {/* Nutritional Color Coding Legend */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Nutritional Values Guide:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-red-100 border border-red-600 mr-2"></div>
                        <span className="text-red-600">Exceeds Health Goal Limits</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-600 mr-2"></div>
                        <span className="text-yellow-600">High Values</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-600 mr-2"></div>
                        <span className="text-green-600">Optimal Values</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-blue-100 border border-blue-600 mr-2"></div>
                        <span className="text-blue-600">Low Values</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analysis.nutritionalInfo.perServing).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`p-4 rounded-lg border ${getNutrientStyle(key, userPreferences)}`}
                      >
                        <div className="text-sm text-gray-500 capitalize">{key}</div>
                        <div className="text-lg font-semibold">
                          {typeof value === 'object' ? value.total : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Ingredient Details Modal */}
        {selectedIngredient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div 
              className={`bg-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${
                isModalMaximized 
                  ? 'fixed inset-4 max-w-none m-0' 
                  : 'max-w-2xl w-full max-h-[85vh]'
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Modal Header with Logo */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt="Product" 
                          className="w-12 h-12 object-contain rounded-lg shadow-sm"
                        />
                      )}
                      <div>
                        <h3 className={`text-2xl font-semibold ${getIngredientTextStyle(selectedIngredient, userPreferences)}`}>
                          {selectedIngredient}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {analysis?.productName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsModalMaximized(!isModalMaximized)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        title={isModalMaximized ? "Minimize" : "Maximize"}
                      >
                        {isModalMaximized ? (
                          <ChevronRight className="w-5 h-5" />
                        ) : (
                          <Image className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedIngredient(null)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className={`flex-1 overflow-y-auto p-6 ${isModalMaximized ? 'h-full' : ''}`}>
                  {isLoadingIngredient ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : ingredientError ? (
                    <div className="p-4 bg-red-50 rounded-lg text-red-800">
                      <p>{ingredientError}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Analysis Sections */}
                      {ingredientDetails?.split('\n').map((section, index) => {
                        const [title, ...content] = section.split(':');
                        if (content.length === 0) return <p key={index}>{section}</p>;
                        
                        const sectionContent = content.join(':').trim();
                        const textColorClass = getIngredientTextStyle(sectionContent, userPreferences);
                        
                        return (
                          <div key={index} className="rounded-lg bg-gray-50 p-4">
                            <h4 className="text-lg font-semibold text-gray-900">{title}:</h4>
                            <p className={`mt-2 ${textColorClass}`}>{sectionContent}</p>
                          </div>
                        );
                      })}

                      {/* Voice Interaction */}
                      <div className="pt-6 border-t border-gray-100">
                        <AnalysisVoiceover
                          analysis={{
                            type: 'ingredient',
                            name: selectedIngredient,
                            details: ingredientDetails || '',
                            productName: selectedIngredient,
                            ingredients: {
                              list: [selectedIngredient],
                              preservatives: [],
                              additives: [],
                              antioxidants: [],
                              stabilizers: []
                            }
                          }}
                          className="w-full"
                        />
                      </div>

                      {/* Color Coding Legend */}
                      <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-lg font-semibold mb-4">Color Coding Guide</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2 p-2 rounded-lg bg-red-50">
                            <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                            <span className="text-sm">Allergen Warning</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-lg bg-orange-50">
                            <span className="w-3 h-3 bg-orange-600 rounded-full"></span>
                            <span className="text-sm">Dietary Restriction</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-lg bg-yellow-50">
                            <span className="w-3 h-3 bg-yellow-600 rounded-full"></span>
                            <span className="text-sm">Health Goal Consideration</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50">
                            <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                            <span className="text-sm">Healthy Ingredient</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Save Analysis</h3>
                <p className="text-gray-600 mb-6">
                  This will save the analysis to your dashboard for future reference.
                </p>
                
                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg">
                    {saveError}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Results;