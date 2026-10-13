import {
  Brain,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AIChatAssistant from '../components/AIChatAssistant';
import { trackPendoEvent } from '../utils/pendo';

// Flask ML service (ml-model/api/app1.py)
const ANALYZE_ENDPOINT = 'http://localhost:5001/analyze';

const AIAnalysis = () => {
  const insights = [
    {
      title: 'Health Risk Assessment',
      description:
        "Based on your recent activity patterns, there's a moderate risk of vitamin D deficiency. Consider spending more time outdoors.",
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      category: 'Risk Analysis',
      priority: 'Medium',
      details:
        'Learn more about vitamin D deficiency and its impact on health.',
    },
    {
      title: 'Lifestyle Recommendation',
      description:
        'Your sleep pattern shows improvement. Keep maintaining your current bedtime routine for optimal rest.',
      icon: <Sparkles className="w-8 h-8 text-teal-500" />,
      category: 'Wellness',
      priority: 'Low',
      details: 'Explore sleep optimization techniques and recommendations.',
    },
    {
      title: 'Nutrition Insight',
      description:
        'Your protein intake is below the recommended level. Consider adding more lean proteins to your diet.',
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      category: 'Nutrition',
      priority: 'High',
      details: 'Discover protein-rich foods and meal planning tips.',
    },
  ];



  const handleAnalyze = async () => {
    const data = {
      heartRate: 75,
      steps: 8000,
      calories: 2300,
    };
    const startedAt = Date.now();
    let result = null;
    let requestError;

    try {
      const response = await fetch(ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      result = await response.json();
    } catch (error) {
      console.error('AI analysis error:', error.message);
      requestError = error.message;
    }
    const errorMessage = result?.error ?? requestError;

    // Pendo: AI analysis finished, successfully or not. Only the derived score and
    // recommendation are sent, never the raw vitals.
    trackPendoEvent('ai_health_analysis_completed', {
      success: Boolean(result?.success),
      predictedActivityScore: result?.insights?.predicted_activity_score,
      recommendation: result?.insights?.recommendation,
      inputMetrics: Object.keys(data),
      durationMs: Date.now() - startedAt,
      errorMessage: errorMessage && String(errorMessage).slice(0, 100),
    });
  };
  
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Health Insights
          </h1>
          <p className="text-gray-600">
            Personalized health recommendations powered by AI
          </p>
        </div>

        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {insight.icon}
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {insight.title}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        insight.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : insight.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {insight.priority} Priority
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{insight.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {insight.category}
                  </span>
                  <Link
                    to="/ai-analysis/learn-more"
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
                  >
                    Learn More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
              <button
                  onClick={handleAnalyze}
                  className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Analyze Your Health Data
              </button>
            </div>


        {/* Learn More Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 mt-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How Our AI Works
            </h2>
            <p className="text-gray-600 mb-6">
              Our advanced AI system analyzes your health data to provide
              personalized insights and recommendations. We use machine learning
              algorithms to identify patterns and potential health risks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-teal-50 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-2">
                  Data Analysis
                </h3>
                <p className="text-sm text-teal-700">
                  Processes your health metrics and lifestyle data to identify
                  trends
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">
                  Pattern Recognition
                </h3>
                <p className="text-sm text-purple-700">
                  Detects patterns that might indicate health risks or
                  opportunities
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Recommendations
                </h3>
                <p className="text-sm text-amber-700">
                  Provides personalized suggestions based on your unique profile
                </p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/ai-analysis/learn-more"
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Explore More Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <AIChatAssistant />
      </div>
    </div>
  );
};

export default AIAnalysis;
