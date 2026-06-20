import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Sparkles,
  WandSparkles,
  XCircle,
} from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import {
  addTicketReply,
  getTicketById,
  updateTicketStatus,
} from "../api/ticketApi";
import {
  analyzeTicketWithAI,
  suggestTicketReply,
} from "../api/aiApi";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/roleRedirect";

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [error, setError] = useState("");

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicketById(id),
    enabled: Boolean(id),
  });

  const invalidateTicketQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const replyMutation = useMutation({
    mutationFn: () =>
  addTicketReply(id, {
    message: message.trim(),
    isInternalNote: canUseAI ? isInternalNote : false,
  }),
    onSuccess: () => {
      setMessage("");
      setError("");
      invalidateTicketQueries();
      setIsInternalNote(false);
    },
    onError: (err) => {
      const validationErrors = err.response?.data?.errors;

      setError(
        validationErrors?.[0]?.msg ||
          err.response?.data?.message ||
          "Failed to add reply"
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => updateTicketStatus(id, status),
    onSuccess: () => {
      setError("");
      invalidateTicketQueries();
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || "Failed to update ticket status"
      );
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeTicketWithAI(id),
    onSuccess: () => {
      setError("");
      invalidateTicketQueries();
    },
    onError: (err) => {
      setError(err.response?.data?.message || "AI analysis failed");
    },
  });

  const suggestionMutation = useMutation({
    mutationFn: () => suggestTicketReply(id),
   onSuccess: (suggestedReply) => {
  setMessage(suggestedReply);
  setIsInternalNote(false);
  setError("");
},
    onError: (err) => {
      setError(
        err.response?.data?.message || "AI reply suggestion failed"
      );
    },
  });

  const handleReply = (event) => {
    event.preventDefault();
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
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Loading ticket...</p>
        </div>
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

  const canManageTicket =
    ["agent", "admin"].includes(user?.role) && !isClosed;

  const canUseAI = ["agent", "admin"].includes(user?.role);

  const visibleReplies =
    ticket.replies?.filter(
      (reply) => user?.role !== "customer" || !reply.isInternalNote
    ) || [];

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

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <article className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">
                {ticket.title}
              </h1>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                {ticket.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">
                {ticket.customer?.name || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium capitalize text-gray-900">
                {ticket.category}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Assigned agent</p>
              <p className="font-medium text-gray-900">
                {ticket.assignedAgent?.name || "Unassigned"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Sentiment</p>
              <p className="font-medium capitalize text-gray-900">
                {ticket.sentiment || "Not analyzed"}
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

          {ticket.aiSummary && (
            <div className="mt-5 border-l-4 border-cyan-500 bg-cyan-50 p-4">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-cyan-700" />
                <h2 className="text-sm font-semibold text-cyan-950">
                  AI summary
                </h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-cyan-900">
                {ticket.aiSummary}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {canUseAI && (
              <button
                type="button"
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={16} />
                {analyzeMutation.isPending
                  ? "Analyzing..."
                  : "Analyze with AI"}
              </button>
            )}

            {canManageTicket && ticket.status !== "in-progress" && (
              <button
                type="button"
                onClick={() => statusMutation.mutate("in-progress")}
                disabled={statusMutation.isPending}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Mark in progress
              </button>
            )}

            {canManageTicket && ticket.status !== "resolved" && (
              <button
                type="button"
                onClick={() => statusMutation.mutate("resolved")}
                disabled={statusMutation.isPending}
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Mark resolved
              </button>
            )}

            {canClose && (
              <button
                type="button"
                onClick={() => statusMutation.mutate("closed")}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <XCircle size={16} />
                Close ticket
              </button>
            )}
          </div>
        </article>

        <article className="rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
            <MessageSquare size={18} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">
              Conversation
            </h2>
          </div>

          <div className="space-y-4 p-5">
            {visibleReplies.length === 0 ? (
              <p className="text-sm text-gray-500">No replies yet.</p>
            ) : (
              visibleReplies.map((reply) => {
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
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold">
                        {reply.sender?.name || "User"}{" "}
                        <span
                          className={
                            isMe ? "text-gray-300" : "text-gray-500"
                          }
                        >
                          ({reply.sender?.role || "unknown"})
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

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {reply.message}
                    </p>
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
            <form
              onSubmit={handleReply}
              className="border-t border-gray-200 p-5"
            >
              {canUseAI && (
                <button
                  type="button"
                  onClick={() => suggestionMutation.mutate()}
                  disabled={suggestionMutation.isPending}
                  className="mb-3 inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <WandSparkles size={16} />
                  {suggestionMutation.isPending
                    ? "Generating..."
                    : "Suggest reply"}
                </button>
              )}

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Add reply
                </span>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  maxLength={3000}
                  className="mt-1 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  placeholder="Write your reply..."
                />
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  {message.length}/3000 characters
                </p>

                <button
                  type="submit"
                  disabled={replyMutation.isPending || !message.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-500 sm:w-auto"
                >
                  <Send size={17} />
                  {replyMutation.isPending ? "Sending..." : "Send reply"}
                </button>
              </div>
            </form>
          )}
        </article>
      </section>
    </AppLayout>
  );
};

export default TicketDetails;