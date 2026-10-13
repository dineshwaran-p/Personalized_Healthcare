import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, Heart, Footprints, Flame, Download } from 'lucide-react';
import { trackPendoEvent } from '../utils/pendo';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HealthTracking = () => {
  // Mock data - in a real app, this would come from an API
  const mockHealthData = {
    heartRate: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [72, 75, 73, 78, 71, 74, 73],
    },
    calories: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [2100, 2300, 2200, 2400, 2150, 1900, 2000],
    },
    steps: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [8000, 10000, 9500, 11000, 9000, 7500, 8500],
    },
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const heartRateData = {
    labels: mockHealthData.heartRate.labels,
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: mockHealthData.heartRate.data,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const caloriesData = {
    labels: mockHealthData.calories.labels,
    datasets: [
      {
        label: 'Calories Burned',
        data: mockHealthData.calories.data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const stepsData = {
    labels: mockHealthData.steps.labels,
    datasets: [
      {
        label: 'Steps',
        data: mockHealthData.steps.data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const handleExport = () => {
    // Export the dashboard metrics as a CSV file: one row per day, one column per metric
    const metrics = Object.keys(mockHealthData);
    const days = mockHealthData.steps.labels;
    const csv = [
      ['Day', ...metrics],
      ...days.map((day, i) => [day, ...metrics.map((metric) => mockHealthData[metric].data[i])]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'health-data.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);

    // Pendo: export file generated and download started
    trackPendoEvent('health_data_exported', {
      exportFormat: 'csv',
      metricsIncluded: metrics,
      periodDays: days.length,
      dataPointCount: metrics.length * days.length,
      fileSizeBytes: blob.size,
    });
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Tracking Dashboard</h1>
          <p className="text-gray-600">Monitor your daily health metrics and trends</p>
        </div>

        {/* Vital Signs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-rose-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Heart Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              75 <span className="text-sm text-gray-500">BPM</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: 5 mins ago</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <Flame className="w-8 h-8 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Calories</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              2,345 <span className="text-sm text-gray-500">kcal</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">Daily goal: 2,500 kcal</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <Footprints className="w-8 h-8 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">8,742</p>
            <p className="text-sm text-gray-500 mt-2">Daily goal: 10,000 steps</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Activity Score</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              82<span className="text-sm text-gray-500">/100</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">Above average</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Heart Rate Trend</h3>
            <Line options={chartOptions} data={heartRateData} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Calories Burned</h3>
            <Line options={chartOptions} data={caloriesData} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-xl font-semibold mb-4">Steps Overview</h3>
          <Line options={chartOptions} data={stepsData} />
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthTracking;