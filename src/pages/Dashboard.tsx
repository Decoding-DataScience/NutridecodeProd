import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAnalysisHistory, getUserProfile } from '../services/supabase';
import ScrollProgress from '../components/ScrollProgress';
import { Clock } from 'lucide-react';

interface FoodAnalysis {
  id: string;
  created_at: string;
  product_name: string;
  image_url: string;
  analysis_result: any;
  ingredients_list?: string[];
  preservatives?: string[];
  additives?: string[];
  antioxidants?: string[];
  stabilizers?: string[];
  declared_allergens?: string[];
  may_contain_allergens?: string[];
  nutritional_info?: any;
  health_score: number;
  health_claims?: string[];
  packaging_materials?: string[];
  recycling_info?: string;
  sustainability_claims?: string[];
  certifications?: string[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState<FoodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActivity();
    if (user?.id) {
      getUserProfile(user.id).then(profile => {
        setUserProfile(profile);
      });
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    try {
      const history = await getAnalysisHistory();
      setRecentActivity(history.slice(0, 3)); // Get only the 3 most recent items
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScanning = () => {
    navigate('/scan');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleUpdatePreferences = () => {
    navigate('/preferences');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleViewDetails = (item: FoodAnalysis) => {
    // Transform the analysis result to match the expected format
    const analysisResult = item.analysis_result || {};
    
    navigate('/results', {
      state: {
        analysis: {
          productName: item.product_name,
          ingredients: {
            list: item.ingredients_list || [],
            preservatives: item.preservatives || [],
            additives: item.additives || [],
            antioxidants: item.antioxidants || [],
            stabilizers: item.stabilizers || []
          },
          allergens: {
            declared: item.declared_allergens || [],
            mayContain: item.may_contain_allergens || []
          },
          nutritionalInfo: {
            perServing: item.nutritional_info?.perServing || {
              calories: 0,
              protein: 0,
              carbs: 0,
              sugar: 0,
              fats: { total: 0 }
            }
          },
          healthScore: item.health_score || 0,
          healthClaims: item.health_claims || [],
          packaging: {
            materials: item.packaging_materials || [],
            recyclingInfo: item.recycling_info || '',
            sustainabilityClaims: item.sustainability_claims || [],
            certifications: item.certifications || []
          },
          storage: analysisResult.storage || {
            instructions: [],
            bestBefore: null
          },
          manufacturer: analysisResult.manufacturer || {
            name: '',
            address: '',
            contact: null
          }
        },
        imageUrl: item.image_url
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <ScrollProgress />
      
      {/* Main Content */}
      <main className="pt-16">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold">
              Welcome back, {userProfile?.full_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="mt-2 text-white/90">
              Continue your journey to healthier food choices
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Scan Food</h3>
              <p className="text-gray-600">
                Instantly analyze any food item with our AI scanner
              </p>
              <button onClick={handleStartScanning} className="mt-4 btn-primary">
                Start Scanning
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">View History</h3>
              <p className="text-gray-600">
                Access your past scans and analysis results
              </p>
              <button onClick={handleViewHistory} className="mt-4 btn-secondary">
                View History
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Update Preferences</h3>
              <p className="text-gray-600">
                Customize your dietary preferences and alerts
              </p>
              <button onClick={handleUpdatePreferences} className="mt-4 btn-secondary">
                Update Now
              </button>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border-b last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity. Start by scanning a food item!
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;