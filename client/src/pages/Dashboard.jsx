import { TicketPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Customer</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">
              Welcome, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create tickets and track support conversations.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <TicketPlus className="mx-auto text-gray-500" size={34} />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            Customer dashboard ready
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Next we will add create ticket and ticket list UI.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;