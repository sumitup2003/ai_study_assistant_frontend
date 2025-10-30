import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../Layout/Navbar";
import Sidebar from "../Layout/Sidebar";
import StatsCard from "./StatsCard";
import ProgressCharts from "./ProgressCharts";
import {
  BookOpen,
  CreditCard,
  Award,
  Clock,
  TrendingUp,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/analytics?days=7"),
      ]);

      setStats(statsRes.data.stats);
      setAnalytics(analyticsRes.data.analytics);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's your learning progress
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 overflow-x-auto">
              <StatsCard
                title="Notes Uploaded"
                value={stats?.notesUploaded || 0}
                icon={BookOpen}
                color="blue"
              />
              <StatsCard
                title="Flashcards Mastered"
                value={`${stats?.flashcardsMastered || 0}/${
                  stats?.flashcardsTotal || 0
                }`}
                icon={CreditCard}
                color="green"
              />
              <StatsCard
                title="Quizzes Taken"
                value={stats?.quizzesTaken || 0}
                icon={Award}
                color="purple"
              />
              <StatsCard
                title="Study Time (Week)"
                value={`${stats?.weekStudyTime || 0} min`}
                icon={Clock}
                color="orange"
              />
            </div>
            {/* Charts */}
            {analytics && <ProgressCharts analytics={analytics} />}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/notes"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Upload Notes
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add new study material
                    </p>
                  </div>
                </Link>

                <Link
                  to="/chat"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Start Chatting
                    </h3>
                    <p className="text-sm text-gray-600">Ask questions to AI</p>
                  </div>
                </Link>

                <Link
                  to="/quiz"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Award className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Take Quiz</h3>
                    <p className="text-sm text-gray-600">Test your knowledge</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            {stats?.recentActivity && stats.recentActivity.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {stats.recentActivity.slice(0, 5).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.activityType.charAt(0).toUpperCase() +
                            activity.activityType.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.note?.title || "Study session"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.duration} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
