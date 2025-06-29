import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, User, Send, TrendingUp, DollarSign, BarChart3, Sparkles, ArrowLeft } from "lucide-react";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export default function AiAnalysis() {
  const navigate = useNavigate();
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "ai",
      content: "Hi! I'm your AI financial assistant. Ask me anything about your finances, e.g. 'What is my total income and expenses?', 'Biggest spending categories?', 'Any unusual patterns?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Fetch current user's transactions on mount
    const fetchTransactions = async () => {
      try {
        // Simulated API call - replace with actual API
        // const res = await API.get("/transactions/user");
        // setTransactions(res.data);
        setTransactions([]);
      } catch {
        setTransactions([]);
      }
    };
    fetchTransactions();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setIsTyping(true);
    setChat((prev) => [...prev, { role: "user", content: input }]);
    
    try {
      // Simulated API call with delay for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Replace with actual API call
      // const res = await API.post("/ai/analyze", {
      //   question: input,
      //   transactions,
      // });
      
      setChat((prev) => [
        ...prev,
        { role: "ai", content: "Based on your financial data, I can see some interesting patterns. Your spending has been consistent, with the largest categories being groceries and entertainment. Would you like me to dive deeper into any specific area?" },
      ]);
      setInput("");
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "ai", content: "I'm having trouble analyzing your data right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "What's my spending trend?",
    "Show my top categories",
    "Any budget insights?",
    "Monthly comparison"
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Back to Dashboard Button - move here for visibility */}
        <div className="w-full max-w-2xl mb-4 flex">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow transition-all font-semibold border border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Bot className="w-12 h-12 text-purple-400" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-spin" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            AI Financial Assistant
          </h1>
          <p className="text-gray-400">Get intelligent insights about your spending patterns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm text-gray-300">Insights</p>
            <p className="text-xl font-bold text-white">{chat.length - 1}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <DollarSign className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-sm text-gray-300">Transactions</p>
            <p className="text-xl font-bold text-white">{transactions.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-sm text-gray-300">Analysis</p>
            <p className="text-xl font-bold text-white">Active</p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600/50 to-blue-600/50 p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold">Chat with AI</h2>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 animate-fade-in ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                    : "bg-gradient-to-r from-green-500 to-teal-500"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto"
                    : "bg-white/20 text-white backdrop-blur-sm border border-white/20"
                } transform transition-all duration-300 hover:scale-105`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/20 text-white backdrop-blur-sm border border-white/20 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {chat.length === 1 && (
            <div className="p-4 border-t border-white/20">
              <p className="text-sm text-gray-300 mb-3">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-white/20 bg-white/5">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                placeholder="Ask about your finances..."
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center gap-2 shadow-lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Thinking..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-400 text-sm mt-6 text-center">
          Powered by AI • Your financial data is secure and private
        </p>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-white\/20::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}