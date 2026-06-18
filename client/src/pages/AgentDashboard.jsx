import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Inbox, MessageSquare } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import { getAssignedTickets } from "../api/ticketApi";

const AgentDashboard = () => {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["assigned-tickets"],
    queryFn: getAssignedTickets,
  });

  const activeTickets = tickets.filter((ticket) =>
    ["assigned", "in-progress"].includes(ticket.status)
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  );

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Agent dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Work through assigned tickets and support conversations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Assigned</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {tickets.length}
                </p>
              </div>
              <Inbox className="text-gray-500" size={24} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {activeTickets.length}
                </p>
              </div>
              <Clock className="text-gray-500" size={24} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {resolvedTickets.length}
                </p>
              </div>
              <CheckCircle2 className="text-gray-500" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Assigned tickets
            </h2>
          </div>

          {isLoading ? (
            <p className="p-5 text-sm text-gray-500">
              Loading assigned tickets...
            </p>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto text-gray-400" size={34} />
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                No assigned tickets
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tickets assigned by an admin will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="block px-5 py-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {ticket.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {ticket.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>Customer: {ticket.customer?.name}</span>
                        <span>Category: {ticket.category}</span>
                        <span>
                          Created:{" "}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default AgentDashboard;