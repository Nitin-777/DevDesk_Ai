import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { UserPlus, Users } from "lucide-react";
import {
  createAgent,
  getAgents,
} from "../api/adminApi";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

const AgentManagement = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: agents = [],
    isLoading,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
  });

  const createMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: (agent) => {
      setFormData(initialForm);
      setError("");
      setSuccess(`${agent.name} was created successfully.`);

      queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-overview"],
      });
    },
    onError: (err) => {
      const validationErrors = err.response?.data?.errors;

      setSuccess("");
      setError(
        validationErrors?.[0]?.msg ||
          err.response?.data?.message ||
          "Failed to create agent"
      );
    },
  });

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-500" />

          <h2 className="text-base font-semibold text-gray-900">
            Support agents
          </h2>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Create support accounts and review active agents.
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <div className="order-2 border-t border-gray-200 lg:order-1 lg:border-r lg:border-t-0">
          {isLoading ? (
            <p className="p-5 text-sm text-gray-500">
              Loading agents...
            </p>
          ) : agents.length === 0 ? (
            <div className="p-8 text-center">
              <Users
                size={30}
                className="mx-auto text-gray-400"
              />

              <p className="mt-2 text-sm text-gray-500">
                No active agents found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {agents.map((agent) => (
                <div
                  key={agent._id}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {agent.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {agent.email}
                    </p>
                  </div>

                  <span className="ml-auto rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="order-1 space-y-4 p-5 lg:order-2"
        >
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-gray-500" />

            <h3 className="text-sm font-semibold text-gray-900">
              Create agent
            </h3>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Name
            </span>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={50}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              placeholder="Agent name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Email
            </span>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              placeholder="agent@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Temporary password
            </span>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              maxLength={72}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              placeholder="Minimum 8 characters"
            />
          </label>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            <UserPlus size={17} />

            {createMutation.isPending
              ? "Creating..."
              : "Create agent"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AgentManagement;