import { Link, NavLink } from "react-router-dom";
import { Headphones, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

 const navItemsByRole = {
  customer: [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "New Ticket", to: "/tickets/new", icon: PlusCircle },
  ],
  agent: [{ label: "Dashboard", to: "/agent", icon: LayoutDashboard }],
  admin: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
};

const navItems = navItemsByRole[user?.role] || [];
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link
      to={user?.role === "admin" ? "/admin" : user?.role === "agent" ? "/agent" : "/dashboard"}
      className="flex items-center gap-2"
    >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white">
              <Headphones size={20} />
            </span>
            <span className="text-lg font-semibold text-gray-900">
              DevDesk AI
            </span>
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg bg-white p-3 shadow-sm">
          <div className="mb-3 rounded-md bg-gray-50 px-3 py-2">
            <p className="text-xs font-medium uppercase text-gray-500">
              {user?.role}
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.name}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;