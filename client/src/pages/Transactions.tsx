import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { saveAs } from "file-saver";

interface Transaction {
  _id: string;
  date: string;
  amount: number;
  category: string;
  status: string;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, categoryFilter, statusFilter, dateFrom, dateTo, transactions, sortField, sortOrder]);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions/user");
      setTransactions(res.data);
      setFiltered(res.data);
    } catch (err) {
      alert("Failed to fetch transactions");
    }
  };

  const applyFilters = () => {
    let result = [...transactions];

    if (categoryFilter !== "all") {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }

    if (dateFrom) {
      result = result.filter(t => new Date(t.date) >= new Date(dateFrom));
    }

    if (dateTo) {
      result = result.filter(t => new Date(t.date) <= new Date(dateTo));
    }

    if (search) {
      const value = search.toLowerCase();
      result = result.filter(
        (txn) =>
          txn.category.toLowerCase().includes(value) ||
          txn.status.toLowerCase().includes(value) ||
          txn.date.toLowerCase().includes(value)
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortField as keyof Transaction];
      const bValue = b[sortField as keyof Transaction];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

    setFiltered(result);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ["Date", "Amount", "Category", "Status"];
    const rows = filtered.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.amount,
      t.category,
      t.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "transactions.csv");
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-6xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                Transactions
              </h2>
              <p className="text-gray-400 text-sm">Manage and track your financial data</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold border border-gray-600"
            >
              🔄 Reset Filters
            </button>
            <button
              onClick={exportCSV}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8 p-6 bg-gray-750 rounded-2xl border border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-2 border-gray-600 bg-gray-700 text-white rounded-xl px-4 py-3 w-full focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-sm hover:shadow-md placeholder-gray-400"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-2 border-gray-600 bg-gray-700 text-white rounded-xl px-4 py-3 w-full focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <option value="all">📋 All Categories</option>
            <option value="Revenue">💰 Revenue</option>
            <option value="Expense">💸 Expense</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-gray-600 bg-gray-700 text-white rounded-xl px-4 py-3 w-full focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <option value="all">📊 All Statuses</option>
            <option value="Paid">✅ Paid</option>
            <option value="Pending">⏳ Pending</option>
          </select>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border-2 border-gray-600 bg-gray-700 text-white rounded-xl px-3 py-3 w-full focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border-2 border-gray-600 bg-gray-700 text-white rounded-xl px-3 py-3 w-full focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-700">
          <table className="min-w-full text-left bg-gray-800">
            <thead className="bg-gray-750 border-b-2 border-gray-700">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 font-bold text-gray-300 border-r border-gray-700" onClick={() => setSortField("date")}>
                  📅 Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 font-bold text-gray-300 border-r border-gray-700" onClick={() => setSortField("amount")}>
                  💵 Amount {sortField === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 font-bold text-gray-300 border-r border-gray-700" onClick={() => setSortField("category")}>
                  🏷️ Category {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 font-bold text-gray-300" onClick={() => setSortField("status")}>
                  📈 Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-6xl">🔍</div>
                      <div>
                        <p className="text-xl font-semibold text-gray-400">No transactions found</p>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((txn, index) => (
                  <tr
                    key={txn._id}
                    className={`border-t border-gray-700 hover:bg-gray-750 transition-all duration-300 ${
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                    }`}
                  >
                    <td className="px-6 py-4 border-r border-gray-700 font-medium text-gray-300">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-700">
                      <span className={`font-bold text-lg ${
                        txn.category === "Revenue" ? "text-green-400" : "text-red-400"
                      }`}>
                        ₹{txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-700">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        txn.category === "Revenue" 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {txn.category === "Revenue" ? "💰" : "💸"} {txn.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        txn.status === "Paid" 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {txn.status === "Paid" ? "✅" : "⏳"} {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 p-6 bg-gray-750 rounded-2xl border border-gray-700">
          <p className="text-gray-300 font-medium">
            📊 Showing page <span className="font-bold text-green-400">{currentPage}</span> of <span className="font-bold text-green-400">{totalPages}</span>
          </p>
          
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold border border-gray-600"
          >
            🏠 Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-6 py-3 border-2 border-gray-600 bg-gray-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 hover:border-green-500 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
            >
              ⬅️ Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-6 py-3 border-2 border-gray-600 bg-gray-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 hover:border-green-500 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
            >
              Next ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}