import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

import Analytics from "./pages/Analytics";
import Transactions from "./pages/Transactions"; // You’ll create this later
import ProtectedRoute from "./components/ProtectedRoute";
import AiAnalysis from "./pages/AiAnalysis";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-analysis"
          element={
            <ProtectedRoute>
              <AiAnalysis />
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
