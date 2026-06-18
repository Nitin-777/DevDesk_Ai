import api from "./axios";

export const createTicket = async (ticketData) => {
  const { data } = await api.post("/tickets", ticketData);
  return data.ticket;
};

export const getMyTickets = async () => {
  const { data } = await api.get("/tickets/my");
  return data.tickets;
};

export const getTicketById = async (ticketId) => {
  const { data } = await api.get(`/tickets/${ticketId}`);
  return data.ticket;
};

export const addTicketReply = async (ticketId, replyData) => {
  const { data } = await api.post(`/tickets/${ticketId}/replies`, replyData);
  return data.ticket;
};
export const updateTicketStatus = async (ticketId, status) => {
  const { data } = await api.patch(`/tickets/${ticketId}/status`, { status });
  return data.ticket;
};