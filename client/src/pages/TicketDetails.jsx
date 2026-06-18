import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, Send, XCircle } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import {
  addTicketReply,
  getTicketById,
  updateTicketStatus,
} from "../api/ticketApi";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/roleRedirect";

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicketById(id),
  });

  const replyMutation = useMutation({
    mutationFn: () => addTicketReply(id, { message }),
    onSuccess: () => {
      setMessage("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] });
    },
    onError: (err) => {
      const validationErrors = err.response?.data?.errors;

      if (validationErrors?.length > 0) {
        setError(validationErrors[0].msg);
      } else {
        setError(err.response?.data?.message || "Failed to add reply");
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] });
    },
  });

  const handleReply = (e) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Reply message is required");
      return;
    }

    replyMutation.mutate();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <p className="text-sm text-gray-500">Loading ticket...</p>
      </AppLayout>
    );
  }

  if (isError || !ticket) {
    return (
      <AppLayout>
        <section className="rounded-lg bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Ticket not found or you do not have access.
          </p>
          <Link
            to={getDashboardPath(user?.role)}
            className="mt-4 inline-flex text-sm font-medium text-gray-900"
          >
            Back to dashboard
          </Link>
        </section>
      </AppLayout>
    );
  }

  const isClosed = ticket.status === "closed";
  const canClose = user?.role === "customer" && !isClosed;
  const canUpdateWorkStatus =
    ["agent", "admin"].includes(user?.role) && !isClosed;

  return (
    <AppLayout>
      <section className="space-y-6">
        <Link
          to={getDashboardPath(user?.role)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {ticket.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {ticket.description}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-gray-100 pt-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">
                {ticket.customer?.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium text-gray-900">{ticket.category}</p>
            </div>
            <div>
              <p className="text-gray-500">Assigned agent</p>
              <p className="font-medium text-gray-900">
                {ticket.assignedAgent?.name || "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last updated</p>
              <p className="font-medium text-gray-900">
                {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {ticket.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {ticket.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {canUpdateWorkStatus && (
              <>
                <button
                  onClick={() => statusMutation.mutate("in-progress")}
                  disabled={statusMutation.isPending}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                >
                  Mark in progress
                </button>
                <button
                  onClick={() => statusMutation.mutate("resolved")}
                  disabled={statusMutation.isPending}
                  className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Mark resolved
                </button>
              </>
            )}

            {canClose && (
              <button
                onClick={() => statusMutation.mutate("closed")}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
              >
                <XCircle size={16} />
                Close ticket
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
            <MessageSquare size={18} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">
              Conversation
            </h2>
          </div>

          <div className="space-y-4 p-5">
            {ticket.replies?.length === 0 ? (
              <p className="text-sm text-gray-500">No replies yet.</p>
            ) : (
              ticket.replies.map((reply) => {
                const senderId = reply.sender?._id || reply.sender?.id;
                const isMe = senderId === user?.id;

                return (
                  <div
                    key={reply._id}
                    className={`rounded-lg border p-4 ${
                      isMe
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-900"
                    }`}
                  >
                    <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-semibold">
                        {reply.sender?.name || "User"}{" "}
                        <span
                          className={isMe ? "text-gray-300" : "text-gray-500"}
                        >
                          ({reply.sender?.role})
                        </span>
                      </p>
                      <p
                        className={`text-xs ${
                          isMe ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {reply.isInternalNote && (
                      <span className="mb-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                        Internal note
                      </span>
                    )}

                    <p className="text-sm leading-6">{reply.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {isClosed ? (
            <div className="border-t border-gray-200 p-5">
              <p className="text-sm text-gray-500">
                This ticket is closed. Replies are disabled.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReply} className="border-t border-gray-200 p-5">
              {error && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Add reply
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  placeholder="Write your reply..."
                />
              </label>

              <button
                type="submit"
                disabled={replyMutation.isPending}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-500 md:w-auto"
              >
                <Send size={17} />
                {replyMutation.isPending ? "Sending..." : "Send reply"}
              </button>
            </form>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default TicketDetails;