import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Scan,
  AlertTriangle,
  Leaf,
  AlertOctagon,
  Apple,
  Timer,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  Star,
  Users,
  Award,
  Sparkles,
  Brain,
  ChevronLeft,
  ChevronRight,
  Search,
  Camera,
  Upload,
  Cpu,
  FileText
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import VoiceChatButton from '../components/VoiceChatButton';

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
}

export const LandingPage: React.FC = (): JSX.Element => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const sliderImages = [
    {
      productName: "Hummus Chips",
      brand: "Eat Real",
      score: "66/100",
      scoreLabel: "Good",
      image: "/images/hummus-chips.jpg",
      positives: [
        { icon: "protein", label: "Protein", value: "8.5g", desc: "Excellent amount of protein" },
        { icon: "fibre", label: "Fibre", value: "3.4g", desc: "Some fibre" },
        { icon: "saturates", label: "Saturates", value: "1.4g", desc: "Low saturates" },
        { icon: "sugar", label: "Sugar", value: "3g", desc: "Low sugar" }
      ],
      negatives: [
        { icon: "additives", label: "Additives", value: "3", desc: "Additives with limited risk" },
        { icon: "energy", label: "Energy", value: "454 kcal", desc: "A bit too caloric" },
        { icon: "salt", label: "Salt", value: "1.07g", desc: "A bit too much sodium" }
      ]
    },
    {
      productName: "Crunchy Oat Granola Fruit & Nut",
      brand: "Jordans",
      score: "57/100",
      scoreLabel: "Good",
      image: "/images/granola.jpg",
      positives: [
        { icon: "fibre", label: "Fibre", value: "6.1g", desc: "Excellent amount of fibre" },
        { icon: "salt", label: "Salt", value: "0.05g", desc: "Low salt" },
        { icon: "sugar", label: "Sugar", value: "10.9g", desc: "Low impact" },
        { icon: "additives", label: "Additives", value: "1", desc: "No risky additives" }
      ],
      negatives: [
        { icon: "energy", label: "Energy", value: "414 kcal", desc: "A bit too caloric" },
        { icon: "saturates", label: "Saturates", value: "5.6g", desc: "A little too fatty" }
      ]
    },
    {
      productName: "Fat Free Natural Cottage Cheese",
      brand: "Sainsbury's",
      score: "90/100",
      scoreLabel: "Excellent",
      image: "/images/cottage-cheese.jpg",
      positives: [
        { icon: "additives", label: "No additives", value: "✓", desc: "No hazardous substances" },
        { icon: "protein", label: "Protein", value: "10.7g", desc: "Excellent amount of protein" },
        { icon: "energy", label: "Energy", value: "74 kcal", desc: "Low calories" },
        { icon: "saturates", label: "Saturates", value: "0.1g", desc: "Low saturates" },
        { icon: "sugar", label: "Sugar", value: "7.4g", desc: "Low sugar" },
        { icon: "salt", label: "Salt", value: "0.43g", desc: "Low salt" }
      ],
      negatives: []
    },
    {
      productName: "Marmite graze",
      brand: "Graze",
      score: "84/100",
      scoreLabel: "Excellent",
      image: "/images/marmite-graze.jpg",
      positives: [
        { icon: "fruits", label: "Fruits & vegetables", value: "100%", desc: "Excellent quantity" },
        { icon: "protein", label: "Protein", value: "16g", desc: "Excellent amount of protein" },
        { icon: "fibre", label: "Fibre", value: "13g", desc: "Excellent amount of fibre" },
        { icon: "saturates", label: "Saturates", value: "1.8g", desc: "Low saturates" },
        { icon: "sugar", label: "Sugar", value: "1g", desc: "Low sugar" }
      ],
      negatives: [
        { icon: "additives", label: "Additives", value: "5", desc: "Additives with limited risk" },
        { icon: "energy", label: "Energy", value: "440 kcal", desc: "A bit too caloric" },
        { icon: "salt", label: "Salt", value: "1.5g", desc: "A bit too much sodium" }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 2000); // Change slide every 2 seconds

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => 
      prev.includes(index) 
        ? prev.filter(faqIndex => faqIndex !== index)
        : [...prev, index]
    );
  };

  const features = [
    {
      icon: <Scan className="w-8 h-8 text-primary" />,
      title: "Instant Food Recognition",
      description: "Advanced AI scanning identifies ingredients in seconds with 99.9% accuracy",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=100",
      stats: { scans: "10M+", accuracy: "99.9%" }
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-secondary" />,
      title: "Allergen Safety Guard",
      description: "Real-time allergen detection keeps you and your family safe",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=100",
      stats: { allergens: "200+", alerts: "24/7" }
    },
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "Sustainability Tracker",
      description: "Make eco-conscious choices with our environmental impact scoring",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=100",
      stats: { impact: "45%↓", saved: "12T CO2" }
    },
    {
      icon: <AlertOctagon className="w-8 h-8 text-secondary" />,
      title: "Additive Detective",
      description: "Identify harmful additives and artificial ingredients instantly",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1920&q=100",
      stats: { database: "5000+", updates: "Daily" }
    },
    {
      icon: <Apple className="w-8 h-8 text-primary" />,
      title: "Nutrition Insights",
      description: "Detailed nutritional breakdown with personalized recommendations",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&q=100",
      stats: { metrics: "50+", accuracy: "98%" }
    },
    {
      icon: <Timer className="w-8 h-8 text-secondary" />,
      title: "Freshness Monitor",
      description: "Smart expiration tracking and food storage recommendations",
      image: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=1920&q=100",
      stats: { saved: "$400/yr", waste: "60%↓" }
    },
  ];

  const steps = [
    {
      number: '01',
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "Unlock Food Intelligence",
      description: "Transform your smartphone into a powerful food analysis tool. Simply open the app and point your camera at any food item to begin your journey to healthier choices.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1024&q=100",
      achievement: "Join 1M+ users making informed decisions daily",
      stats: { speed: "2 sec", accuracy: "99.9%" }
    },
    {
      number: '02',
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Instant AI Analysis",
      description: "Watch as our advanced AI instantly decodes ingredients, nutrition facts, and potential concerns. Get real-time insights backed by our database of over 1 million products.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1024&q=100",
      achievement: "Access insights from 1M+ product database",
      stats: { database: "1M+", updates: "Real-time" }
    },
    {
      number: '03',
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Personalized Guidance",
      description: "Receive tailored recommendations based on your dietary preferences and health goals. Make confident decisions with clear, actionable insights at your fingertips.",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1024&q=100",
      achievement: "95% of users report healthier choices",
      stats: { satisfaction: "95%", goals: "Achieved" }
    }
  ];

  const benefits = [
    'Make healthier food choices with confidence',
    'Save time reading complex labels',
    'Avoid allergens and harmful additives',
    'Track your nutrition goals effortlessly',
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Nutrition Expert',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      quote: "NutriDecode+ has revolutionized how my clients approach food choices. The instant analysis helps them make informed decisions effortlessly."
    },
    {
      name: 'Michael Chen',
      role: 'Health Coach',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      quote: "This app has made healthy eating so much easier for my family. The allergen alerts are a lifesaver for my son with food sensitivities."
    },
    {
      name: 'Emily Rodriguez',
      role: 'Fitness Instructor',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      quote: "I recommend NutriDecode+ to all my clients. It's like having a nutritionist in your pocket 24/7."
    },
    {
      name: 'David Kim',
      role: 'Restaurant Owner',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      quote: "The ingredient analysis feature helps us ensure transparency with our customers about our menu items."
    },
    {
      name: 'Lisa Thompson',
      role: 'Registered Dietitian',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      quote: "The accuracy and depth of nutritional information provided by NutriDecode+ is impressive. It's a game-changer for dietary management."
    },
    {
      name: 'James Wilson',
      role: 'Personal Trainer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      quote: "My clients love tracking their macros with NutriDecode+. The real-time scanning makes meal planning so much more efficient."
    },
    {
      name: 'Maria Garcia',
      role: 'Food Blogger',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      quote: "As someone who reviews different foods daily, NutriDecode+ helps me provide accurate nutritional information to my followers."
    },
    {
      name: 'Robert Taylor',
      role: 'Healthcare Professional',
      image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150',
      quote: "The app's ability to identify potential allergens has been invaluable for my patients with dietary restrictions."
    },
    {
      name: 'Sophie Anderson',
      role: 'Wellness Coach',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      quote: "NutriDecode+ makes it simple for my clients to understand complex nutritional information. The visual breakdowns are excellent."
    },
    {
      name: 'Thomas Wright',
      role: 'Professional Athlete',
      image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
      quote: "Tracking my nutrition is crucial for performance, and NutriDecode+ makes it effortless. The accuracy is spot-on."
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: '1M+', label: 'Active Users' },
    { icon: <Star className="w-6 h-6" />, value: '4.9', label: 'App Store Rating' },
    { icon: <Award className="w-6 h-6" />, value: '50+', label: 'Industry Awards' },
  ];

  const faqCategories = [
    'All',
    'General Usage',
    'Features & Pricing',
    'Technical',
    'Food Analysis',
    'Support & Updates'
  ];

  const faqs = [
    {
      question: 'How does the AI scanning work?',
      answer: 'Our AI scanning technology uses advanced image recognition and machine learning algorithms to analyze food labels, ingredients, and even fresh produce. When you take a picture of a food item, our AI processes the image in real-time, extracting relevant information such as nutritional content, ingredients, and potential allergens.',
      category: 'Technical'
    },
    {
      question: 'What devices are supported?',
      answer: 'NutriDecode+ is available on both iOS and Android devices. The app is optimized for smartphones and tablets running iOS 13+ or Android 8.0+. For the best scanning experience, we recommend using a device with a good quality camera.',
      category: 'Technical'
    },
    {
      question: 'How accurate are the results?',
      answer: 'Our AI-powered scanning technology achieves 99.9% accuracy through advanced machine learning algorithms and continuous training on millions of food items. The system is regularly updated with new data to maintain and improve accuracy.',
      category: 'Food Analysis'
    },
    {
      question: 'Does the app work without an internet connection?',
      answer: 'Yes, basic scanning features work offline. However, for real-time nutritional analysis, allergen alerts, and detailed ingredient information, an internet connection is required to access our comprehensive database.',
      category: 'General Usage'
    },
    {
      question: 'How do you handle food allergies and dietary restrictions?',
      answer: 'NutriDecode+ maintains an extensive database of allergens and dietary restrictions. Users can set up personalized alerts for specific ingredients or nutritional concerns. Our system provides immediate warnings when scanning products containing flagged ingredients.',
      category: 'Food Analysis'
    },
    {
      question: 'What makes NutriDecode+ different from other food scanning apps?',
      answer: 'NutriDecode+ combines advanced AI technology, real-time analysis, and personalized recommendations in one seamless experience. Our unique features include allergen detection, sustainability scoring, and detailed nutritional insights backed by scientific research.',
      category: 'General Usage'
    },
    {
      question: 'Is my personal health data secure?',
      answer: 'Absolutely. We employ industry-leading encryption standards and strict privacy protocols to protect your data. Your personal information is never shared with third parties without explicit consent, and you maintain full control over your data preferences.',
      category: 'Support & Updates'
    },
    {
      question: 'How often do you update the food database?',
      answer: 'Our food database is updated daily with new products, ingredients, and nutritional information. We work closely with manufacturers and food safety organizations to ensure our data is current and accurate.',
      category: 'Support & Updates'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <Header onGetStarted={handleGetStarted} isLanding={true} />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-white pt-16 md:pt-20 lg:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Make Informed Food Choices</span>
                <span className="block text-primary">With AI-Powered Insights</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                Scan food labels instantly, detect allergens, and get personalized nutrition insights powered by advanced AI technology.
              </p>
              <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <button
                    onClick={handleGetStarted}
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white hover:bg-primary-dark md:px-10 md:py-4 md:text-lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <VoiceChatButton className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-center space-x-4 p-6 rounded-xl bg-neutral-light">
                  <div className="p-3 rounded-full bg-primary/10">{stat.icon}</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                Powerful Features
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Everything you need to make informed food choices
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="hero-image">
                    <img src={feature.image} alt={feature.title} />
                  </div>
                  <div className="icon-container">
                    {feature.icon}
                  </div>
                  <div className="content">
                    <h3 className="title">{feature.title}</h3>
                    <p className="description">{feature.description}</p>
                    <div className="stats">
                      {Object.entries(feature.stats).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 capitalize">{key}:</span>
                          <span className="text-sm font-semibold text-primary">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                How It Works
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Three simple steps to healthier choices
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="step-card group">
                  <div className="step-number">
                    <span>{step.number}</span>
                  </div>
                  <div className="step-image">
                    <img src={step.image} alt={step.title} />
                    <div className="step-icon">
                      {step.icon}
                    </div>
                  </div>
                  <div className="step-content">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                    <div className="step-achievement">
                      <Check className="w-5 h-5 text-primary" />
                      <span>{step.achievement}</span>
                    </div>
                    <div className="step-stats">
                      {Object.entries(step.stats).map(([key, value]) => (
                        <div key={key} className="stat-item">
                          <span className="stat-label">{key}</span>
                          <span className="stat-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="step-connector">
                      <ArrowRight className="w-6 h-6 text-primary/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-padding bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Why Choose NutriDecode+?
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 mt-12 md:mt-0">
                <img
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500"
                  alt="App Demo"
                  className="w-full rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                What Our Users Say
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Join thousands of satisfied users making better food choices
              </p>
            </div>
            <div className="relative max-w-3xl mx-auto overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-xl">
                      <div className="flex items-center space-x-4 mb-6">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed italic">"{testimonial.quote}"</p>
                      <div className="mt-4 flex justify-center">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full flex justify-between px-2 z-10">
                <button 
                  onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <button 
                  onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeTestimonial 
                        ? 'w-6 bg-primary' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="section-padding bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                See It In Action
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Watch how NutriDecode+ transforms your shopping experience
              </p>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Video Section */}
              <div className="lg:w-1/2">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{
                      backgroundImage: `url('/images/nutridecode-thumbnail.jpg')`,
                      filter: 'brightness(0.95)'
                    }}
                  />
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/kI44xU_zFi8" 
                    title="NutriDecode is Here! Join Us for the Big Reveal!" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="absolute inset-0 z-10"
                  />
                </div>
              </div>

              {/* Features Steps */}
              <div className="lg:w-1/2 space-y-8">
                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-3 rounded-full bg-green-100">
                    <Camera className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan</h3>
                    <p className="text-gray-600">Use your camera to scan food labels or fresh produce.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload</h3>
                    <p className="text-gray-600">Or upload an existing image of your food item.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Cpu className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyze</h3>
                    <p className="text-gray-600">Our AI processes the image and extracts key information.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Results</h3>
                    <p className="text-gray-600">View detailed nutritional insights and recommendations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Find answers to common questions about NutriDecode+
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {faqCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="max-w-3xl mx-auto space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6"
                  >
                    <span className="text-lg font-medium text-gray-900 text-left">
                      {faq.question}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {faq.category}
                      </span>
                      {openFaqs.includes(index) ? (
                        <ChevronUp className="w-6 h-6 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-primary transition-transform duration-300" />
                      )}
                    </div>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      openFaqs.includes(index)
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                No FAQs found matching your search criteria.
              </div>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Your food, decoded in seconds
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join millions of users making healthier food choices with NutriDecode+
            </p>
            <button onClick={handleGetStarted} className="btn-primary bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all duration-300">
              Get Started Now
            </button>
          </div>
        </section>

        {/* Floating CTA */}
        {isScrolled && (
          <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
            <button onClick={handleGetStarted} className="btn-primary flex items-center space-x-2 shadow-lg">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage; 