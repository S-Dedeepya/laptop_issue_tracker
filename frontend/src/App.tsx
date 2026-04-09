import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth.store";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

// Student Pages
import StudentLayout from "@/pages/student/StudentLayout";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentLaptopRequests from "@/pages/student/StudentLaptopRequests";
import StudentLaptopIssues from "@/pages/student/StudentLaptopIssues";
import StudentExtensions from "@/pages/student/StudentExtensions";
import StudentNotifications from "@/pages/student/StudentNotifications";

// Manager Pages
import ManagerLayout from "@/pages/manager/ManagerLayout";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerLaptops from "@/pages/manager/ManagerLaptops";
import ManagerLaptopRequests from "@/pages/manager/ManagerLaptopRequests";
import ManagerLaptopIssues from "@/pages/manager/ManagerLaptopIssues";
import ManagerLaptopIssuesFilter from "@/pages/manager/ManagerLaptopIssuesFilter";
import ManagerExtensions from "@/pages/manager/ManagerExtensions";

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: string;
}) => {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return (
      <Navigate
        to={user?.role === "STUDENT" ? "/student" : "/manager"}
        replace
      />
    );
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return null;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate
                to={user?.role === "STUDENT" ? "/student" : "/manager"}
              />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/student" /> : <SignupPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to="/student" /> : <ForgotPasswordPage />
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="requests" element={<StudentLaptopRequests />} />
          <Route path="issues" element={<StudentLaptopIssues />} />
          <Route path="extensions" element={<StudentExtensions />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRole="MANAGER">
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="laptops" element={<ManagerLaptops />} />
          <Route path="requests" element={<ManagerLaptopRequests />} />
          <Route path="issues" element={<ManagerLaptopIssues />} />
          <Route path="issues/filter" element={<ManagerLaptopIssuesFilter />} />
          <Route path="extensions" element={<ManagerExtensions />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
