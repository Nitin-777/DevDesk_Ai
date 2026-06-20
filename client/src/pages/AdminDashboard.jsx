import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  Ticket,
  UserCheck,
  Users,
} from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import AnalyticsCharts from "../components/AnalyticsCharts";
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


const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getOverviewStats,
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["all-tickets"],
    queryFn: getAllTickets,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
  });

  const assignMutation = useMutation({
    mutationFn: assignTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });

  const handleAssign = (ticketId, agentId) => {
    if (!agentId) return;
    assignMutation.mutate({ ticketId, agentId });
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
          <p className="text-sm text-gray-500">Loading analytics...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total tickets"
              value={stats.totalTickets}
              icon={Inbox}
            />
            <StatCard label="Open" value={stats.openTickets} icon={Ticket} />
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

        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              All tickets
            </h2>
          </div>

          {ticketsLoading ? (
            <p className="p-5 text-sm text-gray-500">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No tickets found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="px-5 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <Link to={`/tickets/${ticket._id}`} className="flex-1">
                      <h3 className="font-medium text-gray-900 hover:underline">
                        {ticket.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {ticket.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>Customer: {ticket.customer?.name}</span>
                        <span>Category: {ticket.category}</span>
                        <span>
                          Agent: {ticket.assignedAgent?.name || "Unassigned"}
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>

                      <select
                        value={ticket.assignedAgent?._id || ""}
                        onChange={(e) =>
                          handleAssign(ticket._id, e.target.value)
                        }
                        disabled={assignMutation.isPending}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                      >
                        <option value="">Assign agent</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
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
        </div>
      </section>
    </AppLayout>
  );
};

export default AdminDashboard;