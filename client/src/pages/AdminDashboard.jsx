import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Inbox,
  Search,
  Ticket,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import AnalyticsCharts from "../components/AnalyticsCharts";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import AgentManagement from "../components/AgentManagement";
import {
  assignTicket,
  getAgents,
  getAllTickets,
  getOverviewStats,
} from "../api/adminApi";

const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {value ?? 0}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

const initialFilters = {
  search: "",
  status: "",
  priority: "",
  category: "",
  page: 1,
  limit: 10,
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const {
    data: stats = {},
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getOverviewStats,
  });

  const {
    data: ticketResult = {
      tickets: [],
      pagination: {},
    },
    isLoading: ticketsLoading,
    isError: ticketsError,
  } = useQuery({
    queryKey: ["all-tickets", filters],
    queryFn: () => getAllTickets(filters),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
  });

  const tickets = ticketResult.tickets || [];
  const pagination = ticketResult.pagination || {};

  const assignMutation = useMutation({
    mutationFn: assignTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["all-tickets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-overview"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tickets-by-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["agent-workload"],
      });
    },
  });

  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
      page: 1,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateFilter("search", searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters(initialFilters);
  };

  const changePage = (page) => {
    setFilters((previous) => ({
      ...previous,
      page,
    }));
  };

  const handleAssign = (ticketId, agentId) => {
    if (!agentId) return;

    assignMutation.mutate({
      ticketId,
      agentId,
    });
  };

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor support volume, priorities, and ticket ownership.
          </p>
        </div>

        {statsLoading ? (
          <p className="text-sm text-gray-500">
            Loading analytics...
          </p>
        ) : statsError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load analytics.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total tickets"
              value={stats.totalTickets}
              icon={Inbox}
            />

            <StatCard
              label="Open"
              value={stats.openTickets}
              icon={Ticket}
            />

            <StatCard
              label="In progress"
              value={stats.inProgressTickets}
              icon={Clock}
            />

            <StatCard
              label="Resolved"
              value={stats.resolvedTickets}
              icon={CheckCircle2}
            />

            <StatCard
              label="Urgent"
              value={stats.urgentTickets}
              icon={AlertTriangle}
            />

            <StatCard
              label="High priority"
              value={stats.highPriorityTickets}
              icon={AlertTriangle}
            />

            <StatCard
              label="Customers"
              value={stats.totalCustomers}
              icon={Users}
            />

            <StatCard
              label="Agents"
              value={stats.totalAgents}
              icon={UserCheck}
            />
          </div>
        )}

        <AnalyticsCharts />
        <AgentManagement />
        
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              All tickets
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search, filter, review, and assign support tickets.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-3 border-b border-gray-200 p-4 md:grid-cols-2 xl:grid-cols-5"
          >
            <div className="flex">
              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search tickets"
                maxLength={100}
                className="min-w-0 flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />

              <button
                type="submit"
                aria-label="Search tickets"
                title="Search"
                className="flex w-10 shrink-0 items-center justify-center rounded-r-md bg-gray-900 text-white"
              >
                <Search size={17} />
              </button>
            </div>

            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter("status", event.target.value)
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(event) =>
                updateFilter("priority", event.target.value)
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filters.category}
              onChange={(event) =>
                updateFilter("category", event.target.value)
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
              <option value="">All categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="feature-request">
                Feature request
              </option>
              <option value="general">General</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X size={16} />
              Clear filters
            </button>
          </form>

          {ticketsLoading ? (
            <p className="p-5 text-sm text-gray-500">
              Loading tickets...
            </p>
          ) : ticketsError ? (
            <div className="m-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load tickets.
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center">
              <Ticket
                className="mx-auto text-gray-400"
                size={32}
              />

              <p className="mt-3 text-sm font-medium text-gray-900">
                No tickets found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing or clearing the current filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="px-5 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="min-w-0 flex-1"
                    >
                      <h3 className="truncate font-medium text-gray-900 hover:underline">
                        {ticket.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {ticket.description}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>
                          Customer:{" "}
                          {ticket.customer?.name || "Unknown"}
                        </span>

                        <span>
                          Category: {ticket.category}
                        </span>

                        <span>
                          Agent:{" "}
                          {ticket.assignedAgent?.name ||
                            "Unassigned"}
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge
                          priority={ticket.priority}
                        />
                      </div>

                      <select
                        aria-label={`Assign ${ticket.title}`}
                        value={ticket.assignedAgent?._id || ""}
                        onChange={(event) =>
                          handleAssign(
                            ticket._id,
                            event.target.value
                          )
                        }
                        disabled={assignMutation.isPending}
                        className="max-w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:opacity-50"
                      >
                        <option value="">Assign agent</option>

                        {agents.map((agent) => (
                          <option
                            key={agent._id}
                            value={agent._id}
                          >
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
              <p className="text-sm text-gray-500">
                Page {pagination.currentPage} of{" "}
                {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  title="Previous page"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    changePage(pagination.currentPage - 1)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  type="button"
                  aria-label="Next page"
                  title="Next page"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    changePage(pagination.currentPage + 1)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default AdminDashboard;