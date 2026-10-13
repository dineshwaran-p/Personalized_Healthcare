import { useState, useEffect } from 'react';
import { Clock, ChevronRight, Search, Star, Calendar, ShoppingCart } from 'lucide-react';
import mealPlansData from '../../data/mealPlans.json';
import { trackPendoEvent } from '../utils/pendo';

// Wait until the user stops typing / toggling tags before recording a search
const SEARCH_TRACKING_DELAY_MS = 1000;

const DietPlans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const mealPlans = mealPlansData.slice(0,40);

  const allTags = Array.from(new Set(mealPlans.flatMap((plan) => plan.tags)));

  const filteredPlans = mealPlans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => plan.tags.includes(tag));
    return matchesSearch && matchesTags;
  });
  const resultsCount = filteredPlans.length;
  const totalPlans = mealPlans.length;

  // Pendo: record the combined search / tag filter state once the user pauses (skips the empty state)
  useEffect(() => {
    if (!searchTerm.trim() && selectedTags.length === 0) return;

    const timeoutId = setTimeout(() => {
      trackPendoEvent('diet_plan_search_performed', {
        searchTerm: searchTerm.trim().slice(0, 100),
        selectedTags,
        resultsCount,
        totalPlans,
      });
    }, SEARCH_TRACKING_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTags, resultsCount, totalPlans]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleStartPlan = () => {
    // Pendo: user committed to the selected plan. There is no plan start / subscription API yet,
    // so this fires on confirm. The active search and tags tie discovery to conversion.
    trackPendoEvent('diet_plan_started', {
      planTitle: selectedPlan.title,
      price: selectedPlan.price,
      duration: selectedPlan.duration,
      calories: selectedPlan.calories,
      tags: selectedPlan.tags,
      rating: selectedPlan.rating,
      reviews: selectedPlan.reviews,
      searchTerm: searchTerm.trim().slice(0, 100),
      selectedTags,
    });
    setShowModal(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalized Diet Plans</h1>
          <p className="text-gray-600">Customized nutrition plans to meet your health goals</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search meal plans..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">{plan.title}</h3>
                  <p className="text-sm opacity-90">{plan.calories} calories/day</p>
                </div>
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-teal-600">
                  {plan.price}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span className="ml-2 text-gray-600">{plan.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="ml-1 text-gray-700">{plan.rating}</span>
                    <span className="ml-1 text-gray-500">({plan.reviews})</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Protein</p>
                      <p className="font-semibold text-gray-900">{plan.nutritionInfo.protein}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Carbs</p>
                      <p className="font-semibold text-gray-900">{plan.nutritionInfo.carbs}</p>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <ChevronRight className="w-4 h-4 mr-2 text-teal-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Start Plan
                  </button>
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className="flex items-center justify-center px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Details Modal */}
        {showModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedPlan.title}</h3>
                  <p className="text-gray-600">{selectedPlan.description}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Nutrition Information */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">Nutrition Breakdown</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(selectedPlan.nutritionInfo).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 capitalize">{key}</p>
                        <p className="font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Menu */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">Sample Daily Menu</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedPlan.sampleMenu[0].meals.map((meal, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{meal.type}</p>
                          <p className="text-gray-600">{meal.name}</p>
                        </div>
                        <p className="text-gray-500">{meal.calories} cal</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-lg mb-3">Plan Features</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPlan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-teal-600 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handleStartPlan}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Start This Plan
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlans;