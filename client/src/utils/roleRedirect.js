export const getDashboardPath = (role) => {
  if (role === "admin") return "/admin";
  if (role === "agent") return "/agent";
  return "/dashboard";
};