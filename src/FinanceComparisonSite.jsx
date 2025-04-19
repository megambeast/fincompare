import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Check, X, ArrowRight, Menu, ExternalLink, ThumbsUp, ChevronLeft, ChevronRight, Info } from 'lucide-react';

// Backend service for recommendations and tracking
const backendService = {
  // Generate a UUID for user identification
  generateUserId: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  // Get or create user ID from localStorage
  getUserId: () => {
    let userId = localStorage.getItem('fincompare_user_id');
    if (!userId) {
      userId = backendService.generateUserId();
      localStorage.setItem('fincompare_user_id', userId);
    }
    return userId;
  },
  
  // Track user interaction
  trackInteraction: async (productId, interactionType, filters = {}) => {
    const userId = backendService.getUserId();
    try {
      const response = await fetch('https://www.sitebrew.ai/api/<SITE_ID>/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: {
            userId,
            productId,
            interactionType,
            filters,
            timestamp: new Date().toISOString()
          }
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return null;
    }
  },
  
  // Get recommendations for user
  getRecommendations: async (activeCategory) => {
    const userId = backendService.getUserId();
    try {
      const response = await fetch(`https://www.sitebrew.ai/api/<SITE_ID>/recommendations?userId=${userId}&category=${activeCategory}`);
      const data = await response.json();
      return data.document || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
};

// A/B Testing service
const abTestingService = {
  // Get the variant for the current user
  getVariant: () => {
    const userId = backendService.getUserId();
    // Simple hash function to consistently assign users to variants
    const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = ['carousel', 'grid', 'sidebar'];
    return variants[hash % variants.length];
  },
  
  // Track which variant was shown
  trackVariantImpression: async (variant) => {
    const userId = backendService.getUserId();
    try {
      await fetch('https://www.sitebrew.ai/api/<SITE_ID>/ab_testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: {
            userId,
            variant,
            event: 'impression',
            timestamp: new Date().toISOString()
          }
        }),
      });
    } catch (error) {
      console.error('Error tracking variant impression:', error);
    }
  },
  
  // Track when a recommendation is clicked
  trackRecommendationClick: async (variant, productId) => {
    const userId = backendService.getUserId();
    try {
      await fetch('https://www.sitebrew.ai/api/<SITE_ID>/ab_testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: {
            userId,
            variant,
            productId,
            event: 'click',
            timestamp: new Date().toISOString()
          }
        }),
      });
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  }
};

// Recommendations component with A/B testing variants
const Recommendations = ({ activeCategory, products, onProductSelect }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [variant, setVariant] = useState(null);
  const [explanations, setExplanations] = useState({});
  
  // Fetch recommendations when category changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      
      // Get the A/B testing variant
      const testVariant = abTestingService.getVariant();
      setVariant(testVariant);
      
      // Track the variant impression
      abTestingService.trackVariantImpression(testVariant);
      
      // Get recommendations from backend
      const recommendationData = await backendService.getRecommendations(activeCategory);
      
      if (recommendationData.length > 0) {
        // Map recommendation IDs to actual product objects
        const recommendedProducts = recommendationData
          .map(rec => {
            const product = products.find(p => p.id === rec.productId);
            if (product) {
              // Store the explanation for this recommendation
              setExplanations(prev => ({
                ...prev,
                [rec.productId]: rec.explanation
              }));
              return product;
            }
            return null;
          })
          .filter(Boolean);
        
        setRecommendations(recommendedProducts);
      } else {
        // Fallback to random products from the same category if no recommendations
        const categoryProducts = products.filter(p => p.category === activeCategory);
        const randomProducts = [...categoryProducts]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        
        setRecommendations(randomProducts);
        
        // Generate generic explanations for random recommendations
        const genericExplanations = {
          'Popular choice': 'Many users are viewing this product',
          'Highly rated': 'This product has excellent reviews',
          'Great value': 'This product offers competitive features for the price',
          'Staff pick': 'Our experts recommend this product'
        };
        
        const newExplanations = {};
        randomProducts.forEach((product, index) => {
          const explanationKeys = Object.keys(genericExplanations);
          newExplanations[product.id] = genericExplanations[explanationKeys[index % explanationKeys.length]];
        });
        
        setExplanations(newExplanations);
      }
      
      setLoading(false);
    };
    
    fetchRecommendations();
  }, [activeCategory, products]);
  
  // Handle recommendation click
  const handleRecommendationClick = (productId) => {
    // Track the click for A/B testing
    abTestingService.trackRecommendationClick(variant, productId);
    
    // Track the interaction
    backendService.trackInteraction(productId, 'recommendation_click');
    
    // Call the parent handler
    onProductSelect(productId);
  };
  
  // Navigate carousel
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === recommendations.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? recommendations.length - 1 : prevIndex - 1
    );
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c7a7b]"></div>
        </div>
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return null;
  }
  
  // Carousel variant
  if (variant === 'carousel') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {recommendations.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0 px-4">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <img src={product.logo} alt={product.provider} className="h-8 mr-3" />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.provider}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3 bg-blue-50 text-blue-800 p-2 rounded-md text-sm flex items-start">
                      <Info size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                      <span>{explanations[product.id] || 'Recommended based on your preferences'}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Rating</div>
                        <div className="font-medium flex items-center">
                          {product.rating} <span className="text-yellow-500 ml-1">★</span>
                          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                        </div>
                      </div>
                      
                      {product.category === 'Business Banking' && (
                        <div>
                          <div className="text-xs text-gray-500">Monthly Fee</div>
                          <div className="font-medium">${product.monthlyFee}</div>
                        </div>
                      )}
                      
                      {product.category === 'FX Accounts' && (
                        <div>
                          <div className="text-xs text-gray-500">Exchange Rate</div>
                          <div className="font-medium text-sm">{product.exchangeRate}</div>
                        </div>
                      )}
                      
                      {product.category === 'Corporate Cards' && (
                        <div>
                          <div className="text-xs text-gray-500">Annual Fee</div>
                          <div className="font-medium">${product.annualFee}</div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="w-full bg-[#2c7a7b] text-white px-4 py-2 rounded-md hover:bg-[#1d5354] transition-colors"
                      onClick={() => handleRecommendationClick(product.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {recommendations.length > 1 && (
            <>
              <button 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                onClick={prevSlide}
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              
              <button 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                onClick={nextSlide}
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>
            </>
          )}
        </div>
        
        {/* Carousel indicators */}
        {recommendations.length > 1 && (
          <div className="flex justify-center mt-4">
            {recommendations.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${index === currentIndex ? 'bg-[#2c7a7b]' : 'bg-gray-300'}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Grid variant
  if (variant === 'grid') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((product) => (
            <div 
              key={product.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleRecommendationClick(product.id)}
            >
              <div className="flex items-center mb-3">
                <img src={product.logo} alt={product.provider} className="h-8 mr-3" />
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.provider}</p>
                </div>
              </div>
              
              <div className="mb-3 bg-blue-50 text-blue-800 p-2 rounded-md text-sm flex items-start">
                <Info size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{explanations[product.id] || 'Recommended based on your preferences'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="font-medium flex items-center">
                  {product.rating} <span className="text-yellow-500 ml-1">★</span>
                  <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                </div>
                
                <ArrowRight size={16} className="text-[#2c7a7b]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Sidebar variant
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
      
      <div className="space-y-4">
        {recommendations.map((product) => (
          <div 
            key={product.id} 
            className="border-l-4 border-[#2c7a7b] pl-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleRecommendationClick(product.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.provider}</p>
                
                <div className="mt-1 text-sm text-blue-800 flex items-center">
                  <Info size={14} className="mr-1" />
                  {explanations[product.id] || 'Recommended based on your preferences'}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="font-medium flex items-center">
                  {product.rating} <span className="text-yellow-500 ml-1">★</span>
                </div>
                <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FinanceComparisonSite() {
  // Product categories
  const categories = ['Business Banking', 'FX Accounts', 'Corporate Cards'];
  const [activeCategory, setActiveCategory] = useState('Business Banking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    monthlyFee: 'all',
    minBalance: 'all',
    features: []
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Sample data for products
  const [products, setProducts] = useState([]);
  
  // Track page view
  useEffect(() => {
    backendService.trackInteraction(null, 'page_view', { category: activeCategory });
  }, []);
  
  useEffect(() => {
    // Simulate fetching data from an API
    const fetchProducts = async () => {
      // In a real app, this would be an API call
      const bankingProducts = [
        {
          id: 'b1',
          name: 'Business Pro Account',
          provider: 'National Bank',
          logo: 'https://via.placeholder.com/150x50?text=National+Bank',
          monthlyFee: 15,
          interestRate: '0.01%',
          minBalance: 5000,
          transactionFee: '$0.50 per transaction after 50 free',
          features: ['Online banking', 'Mobile app', 'EFTPOS facilities', '24/7 support'],
          rating: 4.5,
          reviews: 128,
          promos: 'No monthly fee for first 3 months',
          category: 'Business Banking',
          description: 'A comprehensive business account designed for growing businesses with moderate transaction volumes. Includes a suite of digital banking tools and dedicated support.'
        },
        {
          id: 'b2',
          name: 'Startup Business Account',
          provider: 'Metro Bank',
          logo: 'https://via.placeholder.com/150x50?text=Metro+Bank',
          monthlyFee: 0,
          interestRate: '0.005%',
          minBalance: 1000,
          transactionFee: '$1.00 per transaction after 20 free',
          features: ['Online banking', 'Mobile app', 'Free setup'],
          rating: 4.2,
          reviews: 87,
          promos: 'Free business consultation',
          category: 'Business Banking',
          description: 'An entry-level business account with no monthly fees, perfect for startups and small businesses with low transaction volumes.'
        },
        {
          id: 'b3',
          name: 'Enterprise Solution',
          provider: 'Commerce Bank',
          logo: 'https://via.placeholder.com/150x50?text=Commerce+Bank',
          monthlyFee: 25,
          interestRate: '0.02%',
          minBalance: 10000,
          transactionFee: 'Unlimited free transactions',
          features: ['Online banking', 'Mobile app', 'EFTPOS facilities', '24/7 support', 'Dedicated manager', 'International transfers'],
          rating: 4.7,
          reviews: 215,
          promos: 'Reduced international transfer fees',
          category: 'Business Banking',
          description: 'A premium business banking solution for established enterprises with high transaction volumes and international operations. Includes dedicated account management and premium support.'
        },
      ];
      
      const fxProducts = [
        {
          id: 'fx1',
          name: 'Global Business FX',
          provider: 'World Exchange',
          logo: 'https://via.placeholder.com/150x50?text=World+Exchange',
          monthlyFee: 10,
          exchangeRate: 'Mid-market + 0.5%',
          transferFee: '$5 per transfer',
          features: ['40+ currencies', 'Lock-in rates', 'Scheduled transfers', 'API access'],
          rating: 4.6,
          reviews: 156,
          promos: 'First 5 transfers fee-free',
          category: 'FX Accounts',
          description: 'A versatile foreign exchange solution for businesses trading internationally. Offers competitive rates and a range of tools to manage currency risk.'
        },
        {
          id: 'fx2',
          name: 'Business Currency Account',
          provider: 'TransferWise',
          logo: 'https://via.placeholder.com/150x50?text=TransferWise',
          monthlyFee: 0,
          exchangeRate: 'Mid-market + 0.35%',
          transferFee: '$3 per transfer',
          features: ['Hold 50+ currencies', 'Local account details', 'Batch payments'],
          rating: 4.8,
          reviews: 312,
          promos: 'No setup fee',
          category: 'FX Accounts',
          description: 'A modern multi-currency account with transparent pricing and excellent exchange rates. Ideal for businesses that need to receive and send payments in multiple currencies.'
        },
        {
          id: 'fx3',
          name: 'Enterprise FX Solution',
          provider: 'Currency Direct',
          logo: 'https://via.placeholder.com/150x50?text=Currency+Direct',
          monthlyFee: 20,
          exchangeRate: 'Mid-market + 0.2%',
          transferFee: 'Free transfers over $10,000',
          features: ['Dedicated dealer', 'Risk management tools', 'Forward contracts', 'Market analysis'],
          rating: 4.4,
          reviews: 98,
          promos: 'Free FX strategy consultation',
          category: 'FX Accounts',
          description: 'A premium foreign exchange service for businesses with large international payment volumes. Includes personalized service and advanced risk management tools.'
        },
      ];
      
      const cardProducts = [
        {
          id: 'c1',
          name: 'Business Rewards Card',
          provider: 'Global Bank',
          logo: 'https://via.placeholder.com/150x50?text=Global+Bank',
          annualFee: 150,
          interestRate: '18.99%',
          rewardsRate: '1.5 points per $1',
          features: ['Travel insurance', 'Purchase protection', 'Expense management', 'Multiple cards'],
          rating: 4.3,
          reviews: 176,
          promos: '50,000 bonus points on sign-up',
          category: 'Corporate Cards',
          description: 'A rewards-focused business credit card that earns points on all purchases. Includes travel benefits and expense management tools.'
        },
        {
          id: 'c2',
          name: 'Business Platinum Card',
          provider: 'American Express',
          logo: 'https://via.placeholder.com/150x50?text=Amex',
          annualFee: 395,
          interestRate: '16.99%',
          rewardsRate: '2 points per $1',
          features: ['Airport lounge access', 'Travel insurance', 'Concierge service', 'Expense management', 'Purchase protection'],
          rating: 4.7,
          reviews: 245,
          promos: '100,000 bonus points + $200 travel credit',
          category: 'Corporate Cards',
          description: 'A premium business credit card with extensive travel benefits, high rewards rates, and premium concierge services. Ideal for businesses with significant travel expenses.'
        },
        {
          id: 'c3',
          name: 'Business Cash Back Card',
          provider: 'Chase',
          logo: 'https://via.placeholder.com/150x50?text=Chase',
          annualFee: 0,
          interestRate: '14.99%',
          rewardsRate: '2% cash back on all purchases',
          features: ['No foreign transaction fees', 'Expense management', 'Free employee cards'],
          rating: 4.5,
          reviews: 189,
          promos: '$500 cash back after spending $5,000 in first 3 months',
          category: 'Corporate Cards',
          description: 'A no-annual-fee business credit card that earns cash back on all purchases. Simple and straightforward rewards with useful expense management tools.'
        },
      ];
      
      const allProducts = [...bankingProducts, ...fxProducts, ...cardProducts];
      setProducts(allProducts);
    };
    
    fetchProducts();
  }, []);
  
  // Track category change
  useEffect(() => {
    if (products.length > 0) {
      backendService.trackInteraction(null, 'category_change', { category: activeCategory });
    }
  }, [activeCategory, products]);
  
  // Filter products based on active category, search term, and filters
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (product.category !== activeCategory) return false;
    
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.provider.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by monthly fee
    if (filters.monthlyFee !== 'all') {
      if (filters.monthlyFee === 'free' && product.monthlyFee > 0) return false;
      if (filters.monthlyFee === 'under10' && (product.monthlyFee > 10 || product.monthlyFee === 0)) return false;
      if (filters.monthlyFee === 'under25' && (product.monthlyFee > 25 || product.monthlyFee === 0)) return false;
    }
    
    // Filter by minimum balance
    if (filters.minBalance !== 'all' && product.minBalance) {
      if (filters.minBalance === 'under1000' && product.minBalance >= 1000) return false;
      if (filters.minBalance === 'under5000' && (product.minBalance >= 5000 || product.minBalance < 1000)) return false;
      if (filters.minBalance === 'under10000' && (product.minBalance >= 10000 || product.minBalance < 5000)) return false;
    }
    
    // Filter by features
    if (filters.features.length > 0) {
      for (const feature of filters.features) {
        if (!product.features.includes(feature)) return false;
      }
    }
    
    return true;
  });
  
  // Track filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    backendService.trackInteraction(null, 'filter_change', newFilters);
  }, []);
  
  // Track search
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    if (term.length > 2) {
      backendService.trackInteraction(null, 'search', { term });
    }
  }, []);
  
  const toggleProductSelection = useCallback((productId) => {
    // Track product selection for comparison
    backendService.trackInteraction(productId, 'compare_select');
    
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      if (selectedProducts.length < 3) {
        setSelectedProducts([...selectedProducts, productId]);
      }
    }
  }, [selectedProducts]);
  
  const resetFilters = () => {
    setFilters({
      monthlyFee: 'all',
      minBalance: 'all',
      features: []
    });
    setSearchTerm('');
    backendService.trackInteraction(null, 'reset_filters');
  };
  
  const toggleFeatureFilter = (feature) => {
    const newFilters = { ...filters };
    if (filters.features.includes(feature)) {
      newFilters.features = filters.features.filter(f => f !== feature);
    } else {
      newFilters.features = [...filters.features, feature];
    }
    handleFilterChange(newFilters);
  };
  
  // Handle product view
  const handleProductView = useCallback((productId) => {
    backendService.trackInteraction(productId, 'view');
    
    // In a real app, this might navigate to a product detail page
    // For this demo, we'll just select the product for comparison
    if (!selectedProducts.includes(productId)) {
      toggleProductSelection(productId);
    }
  }, [selectedProducts, toggleProductSelection]);
  
  // Get all unique features for the current category
  const allFeatures = [...new Set(
    products
      .filter(product => product.category === activeCategory)
      .flatMap(product => product.features)
  )];
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#1a365d]">FinCompare</h1>
            <span className="ml-2 text-sm bg-[#2c7a7b] text-white px-2 py-1 rounded">Business</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            {categories.map(category => (
              <button
                key={category}
                className={`px-2 py-1 ${activeCategory === category ? 'text-[#2c7a7b] font-semibold border-b-2 border-[#2c7a7b]' : 'text-gray-600 hover:text-[#2c7a7b]'}`}
                onClick={() => {
                  setActiveCategory(category);
                  resetFilters();
                  setSelectedProducts([]);
                  setCompareMode(false);
                }}
              >
                {category}
              </button>
            ))}
          </div>
          
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="container mx-auto px-4">
              {categories.map(category => (
                <button
                  key={category}
                  className={`block w-full text-left px-4 py-2 ${activeCategory === category ? 'text-[#2c7a7b] font-semibold bg-gray-100' : 'text-gray-600'}`}
                  onClick={() => {
                    setActiveCategory(category);
                    setMobileMenuOpen(false);
                    resetFilters();
                    setSelectedProducts([]);
                    setCompareMode(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      {!compareMode && (
        <div className="bg-[#1a365d] text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Compare {activeCategory} for Your Business</h1>
              <p className="text-lg mb-6">Find the best financial products to help your business grow. Compare features, fees, and benefits side by side.</p>
              
              <div className="bg-white rounded-lg p-2 flex items-center shadow-lg">
                <Search className="text-gray-400 ml-2" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeCategory}...`}
                  className="flex-1 p-2 outline-none text-gray-800"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <button 
                  className="bg-[#2c7a7b] text-white px-4 py-2 rounded-md hover:bg-[#1d5354] transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} className="inline mr-1" /> Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Recommendations Section */}
        {!compareMode && products.length > 0 && (
          <Recommendations 
            activeCategory={activeCategory} 
            products={products} 
            onProductSelect={handleProductView}
          />
        )}
        
        {/* Filter Panel */}
        {showFilters && !compareMode && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button 
                className="text-[#2c7a7b] hover:underline"
                onClick={resetFilters}
              >
                Reset all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Monthly Fee Filter */}
              <div>
                <h3 className="font-medium mb-2">Monthly Fee</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="monthlyFee" 
                      checked={filters.monthlyFee === 'all'} 
                      onChange={() => handleFilterChange({...filters, monthlyFee: 'all'})}
                      className="mr-2"
                    />
                    All
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="monthlyFee" 
                      checked={filters.monthlyFee === 'free'} 
                      onChange={() => handleFilterChange({...filters, monthlyFee: 'free'})}
                      className="mr-2"
                    />
                    No monthly fee
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="monthlyFee" 
                      checked={filters.monthlyFee === 'under10'} 
                      onChange={() => handleFilterChange({...filters, monthlyFee: 'under10'})}
                      className="mr-2"
                    />
                    Under $10/month
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="monthlyFee" 
                      checked={filters.monthlyFee === 'under25'} 
                      onChange={() => handleFilterChange({...filters, monthlyFee: 'under25'})}
                      className="mr-2"
                    />
                    Under $25/month
                  </label>
                </div>
              </div>
              
              {/* Min Balance Filter - Only for Banking */}
              {activeCategory === 'Business Banking' && (
                <div>
                  <h3 className="font-medium mb-2">Minimum Balance</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="minBalance" 
                        checked={filters.minBalance === 'all'} 
                        onChange={() => handleFilterChange({...filters, minBalance: 'all'})}
                        className="mr-2"
                      />
                      All
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="minBalance" 
                        checked={filters.minBalance === 'under1000'} 
                        onChange={() => handleFilterChange({...filters, minBalance: 'under1000'})}
                        className="mr-2"
                      />
                      Under $1,000
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="minBalance" 
                        checked={filters.minBalance === 'under5000'} 
                        onChange={() => handleFilterChange({...filters, minBalance: 'under5000'})}
                        className="mr-2"
                      />
                      $1,000 - $5,000
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="minBalance" 
                        checked={filters.minBalance === 'under10000'} 
                        onChange={() => handleFilterChange({...filters, minBalance: 'under10000'})}
                        className="mr-2"
                      />
                      $5,000 - $10,000
                    </label>
                  </div>
                </div>
              )}
              
              {/* Features Filter */}
              <div>
                <h3 className="font-medium mb-2">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allFeatures.slice(0, 6).map(feature => (
                    <label key={feature} className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={filters.features.includes(feature)} 
                        onChange={() => toggleFeatureFilter(feature)}
                        className="mr-2"
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Compare Mode Toggle */}
        {!compareMode && selectedProducts.length > 0 && (
          <div className="bg-[#e6f0ff] rounded-lg p-4 mb-6 flex justify-between items-center">
            <div>
              <span className="font-medium">{selectedProducts.length} products selected</span>
              <p className="text-sm text-gray-600">Select up to 3 products to compare side by side</p>
            </div>
            <button 
              className="bg-[#2c7a7b] text-white px-4 py-2 rounded-md hover:bg-[#1d5354] transition-colors"
              onClick={() => {
                setCompareMode(true);
                backendService.trackInteraction(null, 'compare_view', { products: selectedProducts });
              }}
            >
              Compare Selected
            </button>
          </div>
        )}
        
        {/* Comparison View */}
        {compareMode && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Compare {activeCategory}</h2>
              <button 
                className="text-[#2c7a7b] hover:underline flex items-center"
                onClick={() => setCompareMode(false)}
              >
                <X size={16} className="mr-1" /> Exit Comparison
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left font-semibold border-b border-r">Features</th>
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <th key={productId} className="p-4 text-center border-b min-w-[250px]">
                          <img src={product.logo} alt={product.provider} className="h-10 mx-auto mb-2" />
                          <div className="font-bold">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.provider}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Monthly Fee */}
                  <tr>
                    <td className="p-4 font-medium border-b border-r bg-gray-50">Monthly Fee</td>
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <td key={productId} className="p-4 text-center border-b">
                          ${product.monthlyFee}
                          {product.monthlyFee === 0 && <span className="text-green-600 font-medium"> (Free)</span>}
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Category-specific rows */}
                  {activeCategory === 'Business Banking' && (
                    <>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Interest Rate</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              {product.interestRate}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Minimum Balance</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              ${product.minBalance.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Transaction Fees</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              {product.transactionFee}
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}
                  
                  {activeCategory === 'FX Accounts' && (
                    <>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Exchange Rate</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              {product.exchangeRate}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Transfer Fee</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              {product.transferFee}
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}
                  
                  {activeCategory === 'Corporate Cards' && (
                    <>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Annual Fee</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              ${product.annualFee}
                              {product.annualFee === 0 && <span className="text-green-600 font-medium"> (Free)</span>}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Interest Rate</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              {product.interestRate}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium border-b border-r bg-gray-50">Rewards</td>
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <td key={productId} className="p-4 text-center border-b">
                              {product.rewardsRate}
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}
                  
                  {/* Features */}
                  <tr>
                    <td className="p-4 font-medium border-b border-r bg-gray-50">Features</td>
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <td key={productId} className="p-4 text-center border-b">
                          <ul className="text-left pl-6 space-y-1">
                            {product.features.map(feature => (
                              <li key={feature} className="flex items-start">
                                <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Promotions */}
                  <tr>
                    <td className="p-4 font-medium border-b border-r bg-gray-50">Current Promotions</td>
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <td key={productId} className="p-4 text-center border-b">
                          <div className="bg-yellow-50 text-yellow-800 p-2 rounded">
                            {product.promos}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Rating */}
                  <tr>
                    <td className="p-4 font-medium border-b border-r bg-gray-50">Rating</td>
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <td key={productId} className="p-4 text-center border-b">
                          <div className="flex items-center justify-center">
                            <span className="text-lg font-bold mr-1">{product.rating}</span>/5
                          </div>
                          <div className="text-sm text-gray-600">({product.reviews} reviews)</div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Apply Button */}
                  <tr>
                    <td className="p-4 font-medium border-r bg-gray-50"></td>
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <td key={productId} className="p-4 text-center">
                          <button 
                            className="bg-[#2c7a7b] text-white px-6 py-2 rounded-md hover:bg-[#1d5354] transition-colors w-full flex items-center justify-center"
                            onClick={() => backendService.trackInteraction(productId, 'apply')}
                          >
                            Apply Now <ExternalLink size={16} className="ml-1" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Product Listings */}
        {!compareMode && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {filteredProducts.length} {activeCategory} Products
              </h2>
              <div className="flex items-center">
                <span className="mr-2 text-gray-600">Sort by:</span>
                <select 
                  className="border rounded-md p-2 bg-white"
                  onChange={(e) => backendService.trackInteraction(null, 'sort', { sortBy: e.target.value })}
                >
                  <option>Recommended</option>
                  <option>Lowest fees</option>
                  <option>Highest rating</option>
                </select>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <Search size={48} className="mx-auto mb-2" />
                  <h3 className="text-xl font-medium">No products match your filters</h3>
                </div>
                <p className="mb-4">Try adjusting your filters or search criteria to see more results.</p>
                <button 
                  className="text-[#2c7a7b] font-medium hover:underline"
                  onClick={resetFilters}
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-lg shadow-md overflow-hidden ${selectedProducts.includes(product.id) ? 'border-2 border-[#2c7a7b]' : ''}`}
                    onClick={() => backendService.trackInteraction(product.id, 'card_click')}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Logo and Provider */}
                      <div className="p-6 flex flex-col justify-center items-center bg-gray-50 md:w-1/5">
                        <img src={product.logo} alt={product.provider} className="h-12 mb-2" />
                        <div className="text-center">
                          <div className="font-medium">{product.provider}</div>
                          <div className="flex items-center justify-center mt-2">
                            <span className="text-lg font-bold mr-1">{product.rating}</span>/5
                            <span className="text-sm text-gray-600 ml-1">({product.reviews})</span>
                          </div>
                          <button 
                            className="mt-2 text-sm text-[#2c7a7b] flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              backendService.trackInteraction(product.id, 'helpful');
                            }}
                          >
                            <ThumbsUp size={14} className="mr-1" /> Helpful
                          </button>
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                          <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            {product.promos}
                          </div>
                        </div>
                        
                        {/* Category-specific details */}
                        {product.category === 'Business Banking' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-600">Monthly Fee</div>
                              <div className="font-medium">${product.monthlyFee}{product.monthlyFee === 0 && <span className="text-green-600"> (Free)</span>}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Interest Rate</div>
                              <div className="font-medium">{product.interestRate}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Min Balance</div>
                              <div className="font-medium">${product.minBalance.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Transaction Fee</div>
                              <div className="font-medium">{product.transactionFee}</div>
                            </div>
                          </div>
                        )}
                        
                        {product.category === 'FX Accounts' && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-600">Monthly Fee</div>
                              <div className="font-medium">${product.monthlyFee}{product.monthlyFee === 0 && <span className="text-green-600"> (Free)</span>}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Exchange Rate</div>
                              <div className="font-medium">{product.exchangeRate}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Transfer Fee</div>
                              <div className="font-medium">{product.transferFee}</div>
                            </div>
                          </div>
                        )}
                        
                        {product.category === 'Corporate Cards' && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-600">Annual Fee</div>
                              <div className="font-medium">${product.annualFee}{product.annualFee === 0 && <span className="text-green-600"> (Free)</span>}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Interest Rate</div>
                              <div className="font-medium">{product.interestRate}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Rewards</div>
                              <div className="font-medium">{product.rewardsRate}</div>
                            </div>
                          </div>
                        )}
                        
                        {/* Features */}
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">Features</div>
                          <div className="flex flex-wrap gap-2">
                            {product.features.map(feature => (
                              <span key={feature} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center">
                                <Check size={14} className="text-green-500 mr-1" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="p-6 flex flex-col justify-between bg-gray-50 md:w-1/5">
                        <button 
                          className={`mb-4 px-4 py-2 rounded-md border ${
                            selectedProducts.includes(product.id) 
                              ? 'bg-[#2c7a7b] text-white border-[#2c7a7b]' 
                              : 'bg-white text-[#2c7a7b] border-[#2c7a7b] hover:bg-[#f0f9f9]'
                          } transition-colors`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProductSelection(product.id);
                          }}
                        >
                          {selectedProducts.includes(product.id) ? 'Selected' : 'Compare'}
                        </button>
                        
                        <button 
                          className="bg-[#2c7a7b] text-white px-4 py-2 rounded-md hover:bg-[#1d5354] transition-colors flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            backendService.trackInteraction(product.id, 'apply');
                          }}
                        >
                          Apply Now <ArrowRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-[#1a365d] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FinCompare</h3>
              <p className="text-gray-300">Helping businesses find the best financial products since 2023.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product Categories</h4>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category}>
                    <a href="#" className="text-gray-300 hover:text-white">{category}</a>
                  </li>
                ))}
                <li><a href="#" className="text-gray-300 hover:text-white">Business Loans</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Payment Solutions</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Business Banking Guide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FX Strategy for SMEs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Corporate Card Benefits</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Financial Tools</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">How We Compare</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Partner With Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400">
            <p>© 2023 FinCompare. All rights reserved. The information provided on this website is general in nature and does not take into account your personal financial situation. Always seek professional advice before making financial decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
