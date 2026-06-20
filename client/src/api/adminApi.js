import api from "./axios";

export const getOverviewStats = async () => {
  const { data } = await api.get("/analytics/overview");
  return data.stats;
};

export const getAllTickets = async () => {
  const { data } = await api.get("/tickets/all");
  return data.tickets;
};

export const getAgents = async () => {
  const { data } = await api.get("/users/agents");
  return data.agents;
};

export const assignTicket = async ({ ticketId, agentId }) => {
  const { data } = await api.patch(`/tickets/${ticketId}/assign`, { agentId });
  return data.ticket;
};
export const getTicketsByStatus = async () => {
  const { data } = await api.get("/analytics/tickets-by-status");
  return data.data;
};

export const getTicketsByPriority = async () => {
  const { data } = await api.get("/analytics/tickets-by-priority");
  return data.data;
};

export const getTicketsByCategory = async () => {
  const { data } = await api.get("/analytics/tickets-by-category");
  return data.data;
};

export const getAgentWorkload = async () => {
  const { data } = await api.get("/analytics/agent-workload");
  return data.data;
};