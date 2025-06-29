import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

interface Transaction {
  _id: string;
  date: string;
  amount: number;
  category: string;
  status: string;
  user?: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export default function Analytics() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions/user");
      setTransactions(res.data);
    } catch (err) {
      alert("Failed to fetch transactions");
    }
  };

  const filtered = transactions.filter((t) => {
    const categoryMatch =
      filterCategory === "all" || t.category === filterCategory;
    const statusMatch = filterStatus === "all" || t.status === filterStatus;
    const dateMatch =
      (!dateFrom || new Date(t.date) >= new Date(dateFrom)) &&
      (!dateTo || new Date(t.date) <= new Date(dateTo));
    return categoryMatch && statusMatch && dateMatch;
  });

  const trendData = filtered.reduce((acc, curr) => {
    const date = new Date(curr.date).toLocaleDateString();
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({ date, amount: curr.amount });
    }
    return acc;
  }, [] as { date: string; amount: number }[]);

  const barData = Array.from(
    filtered.reduce((map, t) => {
      const key = `${t.category} - ${t.status}`;
      map.set(key, (map.get(key) || 0) + t.amount);
      return map;
    }, new Map<string, number>()),
    ([label, amount]) => ({ label, amount })
  );

  const pieData = Array.from(
    filtered.reduce((map, t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
      return map;
    }, new Map<string, number>()),
    ([name, value]) => ({ name, value })
  );

  const monthMap = new Map<string, { revenue: number; expense: number }>();
  filtered.forEach((t) => {
    const month = new Date(t.date).toLocaleString("default", {
      month: "short",
    });
    if (!monthMap.has(month)) {
      monthMap.set(month, { revenue: 0, expense: 0 });
    }
    const entry = monthMap.get(month)!;
    if (t.category === "Revenue") entry.revenue += t.amount;
    if (t.category === "Expense") entry.expense += t.amount;
  });
  const monthlyData = Array.from(monthMap.entries()).map(([month, value]) => ({
    month,
    ...value,
  }));

  const monthlyStatusMap = new Map<string, { paid: number; pending: number }>();
  filtered.forEach((t) => {
    const month = new Date(t.date).toLocaleString("default", {
      month: "short",
    });
    if (!monthlyStatusMap.has(month)) {
      monthlyStatusMap.set(month, { paid: 0, pending: 0 });
    }
    const entry = monthlyStatusMap.get(month)!;
    if (t.status === "Paid") entry.paid += t.amount;
    else entry.pending += t.amount;
  });
  const monthlyStatusData = Array.from(monthlyStatusMap.entries()).map(
    ([month, value]) => ({
      month,
      ...value,
    })
  );

  const paid = filtered
    .filter((t) => t.status === "Paid")
    .reduce((acc, t) => acc + t.amount, 0);
  const pending = filtered
    .filter((t) => t.status === "Pending")
    .reduce((acc, t) => acc + t.amount, 0);
  const paidPendingData = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
  ];

  const topUsersMap = new Map<string, number>();
  filtered.forEach((t) => {
    const user = t.user || "Unknown";
    topUsersMap.set(user, (topUsersMap.get(user) || 0) + t.amount);
  });
  const topUsersData = Array.from(topUsersMap.entries())
    .map(([user, amount]) => ({ user, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">📊</span>
            Financial Analytics
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold border border-gray-600"
          >
            🏠 Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Filter by Category:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                {Array.from(new Set(transactions.map((t) => t.category))).map(
                  (cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Filter by Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                From Date:
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                To Date:
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Monthly Revenue vs Expense */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                📈 Monthly Revenue vs Expense
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                This line chart compares total revenue and expense per month.
              </p>
            </div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                formatter={(value: number) => [`₹${value}`, "Amount"]}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked Bar Chart: Paid vs Pending per Month */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                📊 Monthly Paid vs Pending Summary
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                Compare paid and pending amounts for each month.
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                formatter={(value: number) => [`₹${value}`, "Amount"]}
              />
              <Legend />
              <Bar dataKey="paid" stackId="a" fill="#4ade80" name="Paid" />
              <Bar
                dataKey="pending"
                stackId="a"
                fill="#facc15"
                name="Pending"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart: Paid vs Pending Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                🥧 Paid vs Pending Distribution
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                View the percentage of paid and pending transactions.
              </p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paidPendingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label
              >
                <Cell fill="#4ade80" />
                <Cell fill="#facc15" />
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                formatter={(value: number) => [`₹${value}`, "Amount"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        

        {/* Category-wise Distribution Pie Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                🗂️ Category-wise Distribution
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                Visualize how your expenses and revenue are distributed across categories.
              </p>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
                formatter={(value: number) => [`₹${value}`, "Amount"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
