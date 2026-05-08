import { Toaster as Sonner } from "sonner";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound.jsx";
import { AppAuthProvider, useAppAuth } from "./lib/AppAuthContext.jsx";

import AppLayout from "./components/layout/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Screener from "./pages/Screener.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import StockDetail from "./pages/StockDetail.jsx";
import AIAnalysis from "./pages/AIAnalysis.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import TwoFactorPage from "./pages/auth/TwoFactorPage.jsx";

function ProtectedRoute({ children }) {
  const { session, loading } = useAppAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-muted-foreground font-mono mt-3">SMALL CAPS ALPHA</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { session, loading } = useAppAuth();

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/verify-2fa" element={<TwoFactorPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/screener" element={<Screener />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/stock/:ticker" element={<StockDetail />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AppAuthProvider>
      <Router>
        <AppRoutes />
      </Router>
      <Sonner richColors position="top-right" />
    </AppAuthProvider>
  );
}

export default App;