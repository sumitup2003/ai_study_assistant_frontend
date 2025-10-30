import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ProgressCharts = ({ analytics }) => {
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Daily Study Time */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Daily Study Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analytics.dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Minutes"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Activity Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={analytics.activityBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => entry._id}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {analytics.activityBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Trends */}
      {analytics.performanceTrends && analytics.performanceTrends.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgAccuracy"
                stroke="#10b981"
                strokeWidth={2}
                name="Accuracy %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject Distribution */}
      {analytics.subjectStats && analytics.subjectStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Subject Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.subjectStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Notes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
         )}
    </div>
  );
};

export default ProgressCharts;