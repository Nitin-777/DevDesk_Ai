import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { getDashboardPath } from "./utils/roleRedirect";
import TicketDetails from "./pages/TicketDetails";
import CreateTicket from "./pages/CreateTicket";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={getDashboardPath(user.role)} replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/tickets/:id"
  element={
    <ProtectedRoute roles={["customer", "agent", "admin"]}>
      <TicketDetails />
    </ProtectedRoute>
  }
/>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent"
        element={
          <ProtectedRoute roles={["agent"]}>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
           

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;