import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, submitWaitlistEntry } from '../services/supabase';
import { Mail, Lock, User, Phone, Briefcase, Heart, MessageCircle, Share2, Bell } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [occupation, setOccupation] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [reasonForJoining, setReasonForJoining] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
    'Keto', 'Paleo', 'Halal', 'Kosher'
  ];

  const healthGoalOptions = [
    'Weight Loss', 'Muscle Gain', 'Better Sleep',
    'More Energy', 'Heart Health', 'Digestive Health'
  ];

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // First, submit to waitlist
        try {
          await submitWaitlistEntry({
            full_name: fullName,
            email: email,
            phone_number: phoneNumber,
            occupation: occupation,
            dietary_preferences: dietaryPreferences,
            health_goals: healthGoals,
            reason_for_joining: reasonForJoining,
            how_did_you_hear: howDidYouHear,
            newsletter_opt_in: newsletterOptIn
          });

          // Then create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName
              }
            }
          });

          if (authError) {
            console.error('Auth error:', authError);
            throw new Error(authError.message);
          }

          if (!authData.user) {
            throw new Error('Failed to create user account');
          }

          // Show success message and redirect
          toast.success('Thank you for joining our waitlist! Please check your email to verify your account.');
          navigate('/auth?mode=signin');
        } catch (waitlistError) {
          console.error('Waitlist error:', waitlistError);
          if (waitlistError instanceof Error) {
            throw waitlistError;
          }
          throw new Error('Failed to submit waitlist entry. Please try again.');
        }
      } else {
        // Sign in
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          console.error('Sign in error:', signInError);
          throw signInError;
        }
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <img 
              src={logo} 
              alt="NutriDecode - Know your Food. Transform your life." 
              className="h-16 w-auto mb-6"
            />
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              {isSignUp ? 'Join the Waitlist' : 'Welcome Back'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSignUp ? (
                'Start your journey to better nutrition'
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {isSignUp && (
                <>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isSignUp && (
                <>
                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number (optional)
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                      Occupation (optional)
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="occupation"
                        name="occupation"
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dietary Preferences
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {dietaryOptions.map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={dietaryPreferences.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDietaryPreferences([...dietaryPreferences, option]);
                              } else {
                                setDietaryPreferences(dietaryPreferences.filter(item => item !== option));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Health Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Health Goals
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {healthGoalOptions.map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={healthGoals.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setHealthGoals([...healthGoals, option]);
                              } else {
                                setHealthGoals(healthGoals.filter(item => item !== option));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Reason for Joining */}
                  <div>
                    <label htmlFor="reasonForJoining" className="block text-sm font-medium text-gray-700">
                      Why do you want to join NutriDecode+?
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="reasonForJoining"
                        name="reasonForJoining"
                        rows={3}
                        value={reasonForJoining}
                        onChange={(e) => setReasonForJoining(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell us why you're interested..."
                      />
                    </div>
                  </div>

                  {/* How Did You Hear */}
                  <div>
                    <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700">
                      How did you hear about us?
                    </label>
                    <div className="mt-1">
                      <select
                        id="howDidYouHear"
                        name="howDidYouHear"
                        value={howDidYouHear}
                        onChange={(e) => setHowDidYouHear(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                      >
                        <option value="">Select an option</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Friend">Friend</option>
                        <option value="Search Engine">Search Engine</option>
                        <option value="Blog">Blog</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Newsletter Opt-in */}
                  <div className="flex items-center">
                    <input
                      id="newsletterOptIn"
                      name="newsletterOptIn"
                      type="checkbox"
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletterOptIn" className="ml-2 block text-sm text-gray-700">
                      Keep me updated about nutrition tips and app updates
                    </label>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : isSignUp ? 'Join Waitlist' : 'Sign In'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;