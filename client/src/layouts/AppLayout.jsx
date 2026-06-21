import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const navItemsByRole = {
    customer: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "New Ticket",
        to: "/tickets/new",
        icon: PlusCircle,
      },
    ],
    agent: [
      {
        label: "Dashboard",
        to: "/agent",
        icon: LayoutDashboard,
      },
    ],
    admin: [
      {
        label: "Dashboard",
        to: "/admin",
        icon: LayoutDashboard,
      },
    ],
  };

  const navItems = navItemsByRole[user?.role] || [];

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "agent"
        ? "/agent"
        : "/dashboard";

  return (
    <div className="min-h-screen bg-[#f3f5f4] text-[#17201d]">
      <header className="sticky top-0 z-40 border-b border-[#dfe4e1] bg-[#fbfcfb]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to={dashboardPath}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#123f35] text-[11px] font-bold text-white">
              DD
            </span>

            <span className="truncate text-[15px] font-semibold text-[#17201d]">DevDesk</span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <NotificationBell />

            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium text-[#58635f] transition hover:bg-[#e9edeb] hover:text-[#17201d] sm:px-3"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 md:grid-cols-[208px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <aside className="self-start border-b border-[#dfe4e1] pb-4 md:sticky md:top-[65px] md:border-b-0 md:pb-0">
          <div className="mb-5 px-2">
            <p className="text-[11px] font-semibold uppercase text-[#79837f]">
              {user?.role}
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-[#17201d]">
              {user?.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-[#79837f]">
              {user?.email}
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto md:block md:space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === dashboardPath}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition md:w-full ${
                      isActive
                        ? "bg-[#dcebe6] text-[#123f35]"
                        : "text-[#58635f] hover:bg-[#e9edeb] hover:text-[#17201d]"
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

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
