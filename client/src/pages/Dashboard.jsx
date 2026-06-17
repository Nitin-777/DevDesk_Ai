import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlusCircle, Ticket } from "lucide-react";
import { getMyTickets } from "../api/ticketApi";
import AppLayout from "../layouts/AppLayout";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const Dashboard = () => {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: getMyTickets,
  });

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              My tickets
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your support requests and latest updates.
            </p>
          </div>

          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            <PlusCircle size={17} />
            New ticket
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {tickets.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Open</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {tickets.filter((ticket) => ticket.status === "open").length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">In progress</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {
                tickets.filter((ticket) => ticket.status === "in-progress")
                  .length
              }
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {tickets.filter((ticket) => ticket.status === "resolved").length}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Recent tickets
            </h2>
          </div>

          {isLoading ? (
            <p className="p-5 text-sm text-gray-500">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center">
              <Ticket className="mx-auto text-gray-400" size={34} />
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                No tickets yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first support ticket to get started.
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
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
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

export default Dashboard;