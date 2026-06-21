import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAgentWorkload,
  getTicketsByCategory,
  getTicketsByPriority,
  getTicketsByStatus,
} from "../api/adminApi";

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#64748b"];

const ChartBox = ({ title, children }) => (
  <section className="min-w-0 rounded-lg bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
    <div className="h-72 w-full">{children}</div>
  </section>
);

const AnalyticsCharts = () => {
  const { data: statusData = [] } = useQuery({
    queryKey: ["tickets-by-status"],
    queryFn: getTicketsByStatus,
  });

  const { data: priorityData = [] } = useQuery({
    queryKey: ["tickets-by-priority"],
    queryFn: getTicketsByPriority,
  });

  const { data: categoryData = [] } = useQuery({
    queryKey: ["tickets-by-category"],
    queryFn: getTicketsByCategory,
  });

  const { data: workload = [] } = useQuery({
    queryKey: ["agent-workload"],
    queryFn: getAgentWorkload,
  });

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartBox title="Tickets by status">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ status, count }) => `${status}: ${count}`}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Tickets by priority">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Tickets by category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="category"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Agent workload">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workload}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="agentName"
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="openWork"
                name="Active"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="resolved"
                name="Resolved"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Agent workload details
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Assigned</th>
                <th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3 font-medium">Resolved</th>
                <th className="px-5 py-3 font-medium">Closed</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {workload.map((agent) => (
                <tr key={agent.agentId}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">
                      {agent.agentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {agent.agentEmail}
                    </p>
                  </td>
                  <td className="px-5 py-3">{agent.totalAssigned}</td>
                  <td className="px-5 py-3">{agent.openWork}</td>
                  <td className="px-5 py-3">{agent.resolved}</td>
                  <td className="px-5 py-3">{agent.closed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default AnalyticsCharts;