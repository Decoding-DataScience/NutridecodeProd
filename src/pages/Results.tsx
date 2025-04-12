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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '../components/Header';
import VoiceoverButton from '../components/VoiceoverButton';
import AnalysisVoiceover from '../components/AnalysisVoiceover';
import VoiceChatButton from '../components/VoiceChatButton';

interface Alert {
  type: 'warning' | 'danger';
  message: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<PreferenceBasedAnalysis | null>(null);
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
      } catch (error) {
        console.error('Error enhancing analysis:', error);
        setAnalysis(location.state.analysis as PreferenceBasedAnalysis);
      } finally {
        setIsLoading(false);
      }
    };

    enhanceAnalysis();
  }, [location.state, navigate]);

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
    const element = document.getElementById('results-content');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`${analysis?.productName}-analysis.pdf`);
  };

  const downloadAsImage = async () => {
    const element = document.getElementById('results-content');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `${analysis?.productName}-analysis.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleIngredientClick = async (ingredient: string) => {
    setSelectedIngredient(ingredient);
    setIngredientDetails(null);
    setIngredientError(null);
    setIsLoadingIngredient(true);

    try {
      const preferences = await getUserPreferences();
      const details = await getDetailedIngredientAnalysis(ingredient, preferences);
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

  const getIngredientColor = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Concerning ingredients
    if (
      lowerIngredient.includes('edta') ||
      lowerIngredient.includes('sugar') ||
      lowerIngredient.includes('salt')
    ) {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    
    // Moderate ingredients
    if (
      lowerIngredient.includes('water') ||
      lowerIngredient.includes('spirit vinegar') ||
      lowerIngredient.includes('lemon juice concentrate')
    ) {
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
    
    // Healthy ingredients
    if (
      lowerIngredient.includes('rapeseed oil') ||
      lowerIngredient.includes('egg') ||
      lowerIngredient.includes('paprika extract')
    ) {
      return 'bg-green-50 text-green-800 border-green-200';
    }
    
    return 'bg-gray-50 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Product Image and Health Score Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 relative">
              <img 
                src={imageUrl} 
                alt={analysis.productName} 
                className="w-full h-64 object-contain mb-4"
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
                <VoiceoverButton 
                  text={analysis.ingredients.list.join(', ')} 
                  className="w-full"
                />
                <VoiceChatButton 
                  className="w-full"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.ingredients.list.map((ingredient, index) => (
                <button
                  key={index}
                  onClick={() => handleIngredientClick(ingredient)}
                  className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer text-left flex items-center justify-between ${getIngredientColor(ingredient)}`}
                >
                  <span>{ingredient}</span>
                  <Info className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          {/* Nutritional Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nutritional Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analysis.nutritionalInfo.perServing).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 capitalize">{key}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {typeof value === 'object' ? value.total : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ingredient Details Modal */}
        {selectedIngredient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
              className={`bg-white rounded-2xl shadow-xl w-full transition-all duration-300 ${
                isModalMaximized 
                  ? 'fixed inset-4 max-w-none m-0' 
                  : 'max-w-2xl max-h-[80vh]'
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedIngredient}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsModalMaximized(!isModalMaximized)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        {isModalMaximized ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6m0 0v6m0-6H4m16 0h-6m0 0v6m0-6h6M4 4h6m0 0v6M4 4v6m16-6h-6m0 0v6m0-6h6M4 4v6" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedIngredient(null)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
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
                      {/* Main Analysis */}
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap">{ingredientDetails}</div>
                      </div>

                      {/* Voice Interaction Buttons */}
                      <div className="space-y-3 pt-6 border-t">
                        <AnalysisVoiceover 
                          analysis={{
                            ...analysis,
                            productName: selectedIngredient,
                            ingredients: { list: [selectedIngredient], preservatives: [], additives: [], antioxidants: [], stabilizers: [] }
                          }} 
                          className="w-full"
                        />
                        <VoiceoverButton 
                          text={ingredientDetails || ''} 
                          className="w-full"
                        />
                        <VoiceChatButton 
                          className="w-full"
                        />
                      </div>

                      {/* Personalized Analysis */}
                      {analysis.preferencesMatch && (
                        <div className="space-y-4 pt-6 border-t">
                          <h4 className="text-lg font-semibold">Personalized Analysis</h4>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {analysis.preferencesMatch.dietaryCompliance.violations.length > 0 && (
                              <div className="p-4 bg-red-50 rounded-lg">
                                <strong className="text-red-800">Dietary Concerns</strong>
                                <ul className="mt-2 space-y-1 text-red-700">
                                  {analysis.preferencesMatch.dietaryCompliance.violations.map((v, i) => (
                                    <li key={i} className="flex items-start">
                                      <AlertTriangle className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                      <span>{v}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {analysis.preferencesMatch.allergenSafety.detectedAllergens.length > 0 && (
                              <div className="p-4 bg-amber-50 rounded-lg">
                                <strong className="text-amber-800">Allergen Information</strong>
                                <ul className="mt-2 space-y-1 text-amber-700">
                                  {analysis.preferencesMatch.allergenSafety.detectedAllergens.map((a, i) => (
                                    <li key={i} className="flex items-start">
                                      <ShieldAlert className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                      <span>{a}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {analysis.preferencesMatch.nutritionalAlignment.concerns.length > 0 && (
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <strong className="text-blue-800">Nutritional Notes</strong>
                                <ul className="mt-2 space-y-1 text-blue-700">
                                  {analysis.preferencesMatch.nutritionalAlignment.concerns.map((c, i) => (
                                    <li key={i} className="flex items-start">
                                      <Info className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                      <span>{c}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sustainability Section */}
                      {analysis.preferencesMatch?.sustainabilityMatch && (
                        <div className="pt-6 border-t">
                          <h4 className="text-lg font-semibold mb-4">Sustainability Impact</h4>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-start">
                              <Leaf className="w-5 h-5 text-green-600 mr-3 mt-1" />
                              <div>
                                <strong className="text-green-800 block mb-2">Environmental Considerations</strong>
                                <ul className="space-y-2 text-green-700">
                                  {analysis.preferencesMatch.sustainabilityMatch.positiveAspects.map((aspect, i) => (
                                    <li key={i} className="flex items-center">
                                      <Check className="w-4 h-4 mr-2" />
                                      {aspect}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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