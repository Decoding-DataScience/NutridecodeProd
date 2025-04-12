import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserPreferences,
  updateUserPreferences,
  type UserPreferences,
  DIETARY_RESTRICTIONS,
  COMMON_ALLERGENS,
  HEALTH_GOALS,
  NUTRIENTS_TO_TRACK,
  PACKAGING_PREFERENCES,
  defaultPreferences
} from '../services/preferences';
import { Check, X, Save, AlertTriangle, Loader2 } from 'lucide-react';
import Header from '../components/Header';

const Preferences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) {
      console.log('No authenticated user, redirecting to login');
      navigate('/auth/login', { state: { returnTo: '/preferences' } });
      return;
    }

    loadPreferences();
  }, [user, navigate]);

  const loadPreferences = async () => {
    if (!user) {
      setError('Please log in to view and update your preferences');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const prefs = await getUserPreferences();
      if (prefs) {
        setPreferences(prefs);
        setRetryCount(0); // Reset retry count on success
      } else {
        console.log('No preferences found, using defaults');
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('Authentication error')) {
          navigate('/auth/login', { state: { returnTo: '/preferences' } });
          return;
        }
        
        setError(error.message);
        
        // Implement retry logic for certain errors
        if (error.message.includes('Database connection error') && retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadPreferences();
          }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
          setError(`${error.message}. Retrying... (Attempt ${retryCount + 1}/3)`);
          return;
        }
      } else {
        setError('Failed to load preferences. Please try again.');
      }
      // Set default preferences as fallback
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('Please log in to save preferences');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Ensure we have all required fields with proper types
      const prefsToSave: Partial<UserPreferences> = {
        ...defaultPreferences,
        ...preferences,
        dietary_restrictions: preferences.dietary_restrictions || [],
        allergen_alerts: preferences.allergen_alerts || [],
        health_goals: preferences.health_goals || [],
        nutrients_to_track: preferences.nutrients_to_track || [],
        packaging_preferences: preferences.packaging_preferences || [],
        notification_preferences: {
          allergen_alerts: true,
          health_insights: true,
          sustainability_tips: true,
          weekly_summary: true,
          ...preferences.notification_preferences
        }
      };

      const savedPreferences = await updateUserPreferences(prefsToSave);
      if (!savedPreferences) {
        throw new Error('Failed to save preferences - no data returned');
      }
      
      setPreferences(savedPreferences);
      setSuccessMessage('Preferences saved successfully!');
      
      // Navigate after a short delay
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please ensure you are logged in and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMultiSelect = (category: keyof UserPreferences, value: string) => {
    const currentValues = preferences[category] as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setPreferences({ ...preferences, [category]: newValues });
  };

  const handleToggle = (category: string, value: boolean) => {
    setPreferences({
      ...preferences,
      notification_preferences: {
        allergen_alerts: true,
        health_insights: true,
        sustainability_tips: true,
        weekly_summary: true,
        ...preferences.notification_preferences,
        [category]: value
      }
    });
  };

  const handleNumberInput = (field: keyof UserPreferences, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setPreferences({ ...preferences, [field]: numValue });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-180px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Update Preferences</h1>
              <div className="flex items-center space-x-4">
                {error && (
                  <button
                    onClick={() => loadPreferences()}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-8">
              {/* Dietary Restrictions */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dietary Restrictions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_RESTRICTIONS.map(restriction => (
                    <button
                      key={restriction}
                      onClick={() => handleMultiSelect('dietary_restrictions', restriction)}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        preferences.dietary_restrictions?.includes(restriction)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-200 hover:border-blue-500'
                      }`}
                    >
                      <span>{restriction}</span>
                      {preferences.dietary_restrictions?.includes(restriction) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Allergens */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Allergen Alerts</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMMON_ALLERGENS.map(allergen => (
                    <button
                      key={allergen}
                      onClick={() => handleMultiSelect('allergen_alerts', allergen)}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        preferences.allergen_alerts?.includes(allergen)
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'border-gray-200 hover:border-red-500'
                      }`}
                    >
                      <span>{allergen}</span>
                      {preferences.allergen_alerts?.includes(allergen) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Health Goals */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Goals</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {HEALTH_GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => handleMultiSelect('health_goals', goal)}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        preferences.health_goals?.includes(goal)
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-200 hover:border-green-500'
                      }`}
                    >
                      <span>{goal}</span>
                      {preferences.health_goals?.includes(goal) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Daily Calorie Target */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Calorie Target</h2>
                <input
                  type="number"
                  value={preferences.daily_calorie_target || ''}
                  onChange={(e) => handleNumberInput('daily_calorie_target', e.target.value)}
                  className="w-full md:w-1/3 p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter daily calorie target"
                />
              </section>

              {/* Nutrients to Track */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutrients to Track</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {NUTRIENTS_TO_TRACK.map(nutrient => (
                    <button
                      key={nutrient}
                      onClick={() => handleMultiSelect('nutrients_to_track', nutrient)}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        preferences.nutrients_to_track?.includes(nutrient)
                          ? 'bg-purple-50 border-purple-500 text-purple-700'
                          : 'border-gray-200 hover:border-purple-500'
                      }`}
                    >
                      <span>{nutrient}</span>
                      {preferences.nutrients_to_track?.includes(nutrient) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Sustainability Preferences */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sustainability Preferences</h2>
                <div className="mb-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.eco_conscious}
                      onChange={(e) => setPreferences({ ...preferences, eco_conscious: e.target.checked })}
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                    <span>I want to make eco-conscious food choices</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PACKAGING_PREFERENCES.map(pref => (
                    <button
                      key={pref}
                      onClick={() => handleMultiSelect('packaging_preferences', pref)}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        preferences.packaging_preferences?.includes(pref)
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-200 hover:border-green-500'
                      }`}
                    >
                      <span>{pref}</span>
                      {preferences.packaging_preferences?.includes(pref) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Notification Settings */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
                <div className="space-y-3">
                  {Object.entries(preferences.notification_preferences || {}).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleToggle(key, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences; 