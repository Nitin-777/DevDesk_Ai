import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { createTicket } from "../api/ticketApi";

const CreateTicket = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    tags: "",
  });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      navigate(`/tickets/${ticket._id}`);
    },
    onError: (err) => {
      const validationErrors = err.response?.data?.errors;

      if (validationErrors?.length > 0) {
        setError(validationErrors[0].msg);
      } else {
        setError(err.response?.data?.message || "Failed to create ticket");
      }
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (formData.title.trim().length < 5) {
      return "Title must be at least 5 characters";
    }
    if (formData.description.trim().length < 10) {
      return "Description must be at least 10 characters";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    mutation.mutate({
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <AppLayout>
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create ticket
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Share the issue clearly so the support team can respond faster.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Title</span>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              placeholder="Payment failed during checkout"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Description
            </span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={7}
              className="mt-1 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              placeholder="Explain what happened, what you expected, and any error message you saw."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Category
              </span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="feature-request">Feature request</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Priority
              </span>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Tags</span>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              placeholder="payment, checkout, subscription"
            />
          </label>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-500 md:w-auto"
          >
            <Send size={17} />
            {mutation.isPending ? "Creating..." : "Create ticket"}
          </button>
        </form>
      </section>
    </AppLayout>
  );
};

export default CreateTicket;