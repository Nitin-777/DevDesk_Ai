import api from "./axios";

export const analyzeTicketWithAI = async (ticketId) => {
  const { data } = await api.post(`/ai/tickets/${ticketId}/analyze`);
  return data;
};

export const suggestTicketReply = async (ticketId) => {
  const { data } = await api.post(`/ai/tickets/${ticketId}/suggest-reply`);
  return data.suggestedReply;
};