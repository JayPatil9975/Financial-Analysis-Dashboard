import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logo.jpg";
import profile from "../60111.jpg";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [userName] = useState("Current User");
  const [monthlyData, setMonthlyData] = useState<
    { month: string; income: number; expense: number }[]
  >([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebarProfile, setShowSidebarProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const sidebarProfileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
    fetchUserEmail();

    // Close popup on outside click for both popups
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
      if (
        sidebarProfileRef.current &&
        !sidebarProfileRef.current.contains(event.target as Node)
      ) {
        setShowSidebarProfile(false);
      }
    }
    if (showProfile || showSidebarProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfile, showSidebarProfile]);

  const fetchSummary = async () => {
    try {
      const res = await API.get("/transactions/user");
      const transactions = res.data;

      let totalIncome = 0;
      let totalExpenses = 0;

      // Prepare monthly data for line chart
      const monthMap = new Map<
        string,
        { income: number; expense: number }
      >();
      transactions.forEach((txn: { category: string; amount: number; date: string }) => {
        const dateObj = new Date(txn.date);
        const month = dateObj.toLocaleString("default", { month: "short", year: "2-digit" });
        if (!monthMap.has(month)) {
          monthMap.set(month, { income: 0, expense: 0 });
        }
        if (txn.category.toLowerCase() === "expense") {
          totalExpenses += txn.amount;
          monthMap.get(month)!.expense += txn.amount;
        } else {
          totalIncome += txn.amount;
          monthMap.get(month)!.income += txn.amount;
        }
      });

      setIncome(totalIncome);
      setExpenses(totalExpenses);
      setBalance(totalIncome - totalExpenses);

      // Sort months chronologically
      const sortedMonths = Array.from(monthMap.entries()).sort(
        ([a], [b]) =>
          new Date("01 " + a).getTime() - new Date("01 " + b).getTime()
      );
      setMonthlyData(
        sortedMonths.map(([month, value]) => ({
          month,
          ...value,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  const fetchUserEmail = async () => {
    try {
      // Adjust endpoint as per your backend
      const res = await API.get("/auth/me");
      setUserEmail(res.data.email);
    } catch {
      setUserEmail("user@gmail.com");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a JSON file");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") {
          return alert("Invalid file content");
        }
        const json = JSON.parse(result);
        if (!Array.isArray(json)) return alert("Invalid JSON format");

        await API.post("/transactions/upload", json);
        alert("Upload successful!");
        fetchSummary();
        navigate("/analytics");
      } catch (err) {
        console.error(err);
        alert("Upload failed.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-screen bg-[#0F1419]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1F2E] flex flex-col py-6 px-4 border-r border-[#2D3748] relative">
        <div className="flex items-center mb-8 px-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-2xl font-bold text-white">Penta</span>
        </div>
        <nav className="flex flex-col gap-1">
          <SidebarItem 
            icon={<DashboardIcon />}
            label="Dashboard"
            active
            onClick={undefined}
          />
          <SidebarItem 
            icon={<TransactionsIcon />} 
            label="Transactions" 
            onClick={() => navigate("/transactions")} 
          />
          <SidebarItem 
            icon={<AnalyticsIcon />} 
            label="Analytics" 
            onClick={() => navigate("/analytics")} 
          />
          <SidebarItem 
            icon={<ChartIcon className="w-4 h-4" />} // <-- add className for smaller icon
            label="AI Analysis"
            onClick={() => navigate("/ai-analysis")}
          />
          {/* Personal Sidebar Item with popup */}
          <div className="relative">
            <SidebarItem
              icon={<PersonalIcon />}
              label="Personal"
              onClick={() => setShowSidebarProfile((v) => !v)}
            />
            {showSidebarProfile && (
              <div
                ref={sidebarProfileRef}
                className="absolute left-full top-1/2 -translate-y-1/2 ml-4 min-w-[220px] bg-[#232836] border border-[#2D3748] rounded-xl shadow-2xl p-6 z-50"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={profile}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-[#10B981] mb-3"
                  />
                  <div className="text-lg font-semibold text-white mb-1">Profile</div>
                  <div className="text-gray-400 text-sm mb-2">Signed in as:</div>
                  <div className="text-base font-medium text-[#10B981] break-all">{userEmail}</div>
                  <button
                    onClick={() => setShowSidebarProfile(false)}
                    className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
        
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="mt-auto bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-4 py-2 rounded-lg hover:from-[#059669] hover:to-[#10B981] transition font-medium"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#0F1419] text-white">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-[#2D3748]">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* <input
                type="text"
                placeholder="Search..."
                className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#10B981]"
              /> */}
              {/* <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
            </div>
            {/* <NotificationIcon className="text-gray-400 cursor-pointer hover:text-white" /> */}
            <div className="flex items-center gap-4 relative">
              <img
                src={profile}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-[#2D3748] cursor-pointer"
                onClick={() => setShowProfile((v) => !v)}
              />
              {showProfile && (
                <div
                  ref={profileRef}
                  className="absolute right-0 top-full mt-3 min-w-[220px] bg-[#232836] border border-[#2D3748] rounded-xl shadow-2xl p-6 z-50"
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={profile}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-[#10B981] mb-3"
                    />
                    <div className="text-lg font-semibold text-white mb-1">Profile</div>
                    <div className="text-gray-400 text-sm mb-2">Signed in as:</div>
                    <div className="text-base font-medium text-[#10B981] break-all">{userEmail}</div>
                    <button
                      onClick={() => setShowProfile(false)}
                      className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Balance"
              value={balance}
              color="text-[#10B981]"
              bgColor="bg-[#1A1F2E]"
              icon={<BalanceIcon />}
            />
            <StatCard
              title="Revenue"
              value={income}
              color="text-[#10B981]"
              bgColor="bg-[#1A1F2E]"
              icon={<RevenueIcon />}
            />
            <StatCard
              title="Expenses"
              value={expenses}
              color="text-[#10B981]"
              bgColor="bg-[#1A1F2E]"
              icon={<ExpensesIcon />}
            />
            <StatCard
              title="Savings"
              value={Math.max(0, balance)}
              color="text-[#10B981]"
              bgColor="bg-[#1A1F2E]"
              icon={<SavingsIcon />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview Chart */}
            <div className="lg:col-span-2 bg-[#1A1F2E] rounded-xl p-6 border border-[#2D3748]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Overview</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                    <span className="text-sm text-gray-400">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                    <span className="text-sm text-gray-400">Expenses</span>
                  </div>
                  <select className="bg-[#0F1419] border border-[#2D3748] rounded-lg px-3 py-1 text-sm text-white">
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid stroke="#2D3748" />
                    <XAxis dataKey="month" stroke="#A0AEC0" />
                    <YAxis stroke="#A0AEC0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1A1F2E",
                        border: "1px solid #2D3748",
                        borderRadius: "8px",
                        color: "#F3F4F6",
                      }}
                      formatter={(value: number) => [`₹${value}`, "Amount"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      name="Expenses"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#1A1F2E] rounded-xl p-6 border border-[#2D3748]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Transaction</h2>
                <button className="text-[#10B981] text-sm hover:underline">See all</button>
              </div>
              
              {/* Upload Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Upload your files</h3>
                <p className="text-gray-400 text-sm mb-4">Only JSON supported</p>
                
                <label
                  htmlFor="fileInput"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#2D3748] rounded-lg p-6 cursor-pointer hover:border-[#10B981] transition"
                >
                  <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">
                    {file ? file.name : "Click to upload"}
                  </span>
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                
                <button
                  onClick={handleUpload}
                  className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-2 rounded-lg hover:from-[#059669] hover:to-[#10B981] transition font-medium mt-4"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Icons Components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
  </svg>
);

const TransactionsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const PersonalIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const SettingIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const NotificationIcon = ({ className }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5-5 5h5zm0 0v-3a3 3 0 00-3-3H9a3 3 0 00-3 3v3" />
  </svg>
);

const BalanceIcon = () => (
  <svg className="w-6 h-6 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-6 h-6 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
  </svg>
);

const ExpensesIcon = () => (
  <svg className="w-6 h-6 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
  </svg>
);

const SavingsIcon = () => (
  <svg className="w-6 h-6 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

// Stat Card Component
type StatCardProps = {
  title: string;
  value: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, color, bgColor, icon }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 border border-[#2D3748]`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        ₹{value.toLocaleString()}
      </div>
    </div>
  );
}

// Sidebar Item Component
type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function SidebarItem({ icon, label, active = false, onClick }: SidebarItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        active
          ? "bg-[#10B981] text-black font-medium"
          : "hover:bg-[#2D3748] text-gray-300 hover:text-white"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}