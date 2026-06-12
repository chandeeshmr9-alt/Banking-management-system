import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import Loans from "@/pages/Loans";
import Branches from "@/pages/Branches";
import Employees from "@/pages/Employees";
import Procedures from "@/pages/Procedures";
import Triggers from "@/pages/Triggers";
import Cards from "@/pages/Cards";
import AuditLogs from "@/pages/AuditLogs";
import LoginPage from "@/pages/Login";
import { useAuth } from "@/lib/auth-context";
import { Toaster } from "sonner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route path="/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
        <Route path="/procedures" element={<ProtectedRoute><Procedures /></ProtectedRoute>} />
        <Route path="/triggers" element={<ProtectedRoute><Triggers /></ProtectedRoute>} />
        
        <Route
          path="*"
          element={
            <div className="flex h-screen items-center justify-center bg-slate-50 p-10 text-center">
              <div className="glass-card max-w-md p-10 rounded-[2rem]">
                <h2 className="text-4xl font-black text-slate-900">404</h2>
                <p className="mt-4 text-slate-600 font-medium">
                  The requested page does not exist in the Banking Management System ecosystem.
                </p>
                <button 
                  onClick={() => window.location.href = "/"}
                  className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg"
                >
                  Return Home
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}
