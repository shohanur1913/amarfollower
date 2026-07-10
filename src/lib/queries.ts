import { useQuery } from "@tanstack/react-query";

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function usePlatforms() {
  return useQuery({
    queryKey: ["platforms"],
    queryFn: () => fetchJSON("/api/platforms"),
  });
}

export function useUserOrders(page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: "15" });
  if (status) params.set("status", status);
  return useQuery({
    queryKey: ["user-orders", page, status],
    queryFn: () => fetchJSON(`/api/user/orders?${params}`),
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => fetchJSON("/api/user/profile"),
  });
}

export function useUserPayments(page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) params.set("status", status);
  return useQuery({
    queryKey: ["user-payments", page, status],
    queryFn: () => fetchJSON(`/api/user/payments?${params}`),
  });
}

export function useUserTickets() {
  return useQuery({
    queryKey: ["user-tickets"],
    queryFn: () => fetchJSON("/api/user/tickets"),
  });
}

export function useAdminUsers(params?: { search?: string; status?: string; role?: string }) {
  const queryString = params
    ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v))).toString()
    : "";
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => fetchJSON(`/api/admin/users${queryString}`),
  });
}

export function useAdminOrders(userId?: string) {
  return useQuery({
    queryKey: userId ? ["admin-orders", userId] : ["admin-orders"],
    queryFn: () => fetchJSON(`/api/admin/orders${userId ? `?userId=${userId}` : ""}`),
  });
}

export function useAdminServices() {
  return useQuery({
    queryKey: ["admin-services"],
    queryFn: () => fetchJSON("/api/admin/services"),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => fetchJSON("/api/admin/categories"),
  });
}

export function useAdminPlatforms() {
  return useQuery({
    queryKey: ["admin-platforms"],
    queryFn: () => fetchJSON("/api/admin/platforms"),
  });
}

export function useAdminProviders() {
  return useQuery({
    queryKey: ["admin-providers"],
    queryFn: () => fetchJSON("/api/admin/providers"),
  });
}

export function useAdminGateways() {
  return useQuery({
    queryKey: ["admin-gateways"],
    queryFn: () => fetchJSON("/api/admin/gateways"),
  });
}

export function useAdminTickets() {
  return useQuery({
    queryKey: ["admin-tickets"],
    queryFn: () => fetchJSON("/api/admin/tickets"),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchJSON("/api/admin/settings"),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchJSON("/api/admin/stats"),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: () => fetchJSON("/api/user/stats"),
  });
}

export function useUserAffiliate() {
  return useQuery({
    queryKey: ["user-affiliate"],
    queryFn: () => fetchJSON("/api/user/affiliate"),
  });
}

export function useUserApiKeys() {
  return useQuery({
    queryKey: ["user-api-keys"],
    queryFn: () => fetchJSON("/api/user/api-keys"),
  });
}

export function useUserScheduledOrders() {
  return useQuery({
    queryKey: ["user-scheduled-orders"],
    queryFn: () => fetchJSON("/api/user/scheduled"),
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => fetchJSON("/api/services"),
  });
}

export function useAdminAffiliates() {
  return useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: () => fetchJSON("/api/admin/affiliates"),
  });
}

export function useAdminRefills() {
  return useQuery({
    queryKey: ["admin-refills"],
    queryFn: () => fetchJSON("/api/admin/refills"),
  });
}

export function useAdminIpWhitelist() {
  return useQuery({
    queryKey: ["admin-ip-whitelist"],
    queryFn: () => fetchJSON("/api/admin/ip-whitelist"),
  });
}

export function useRefills() {
  return useQuery({
    queryKey: ["refills"],
    queryFn: () => fetchJSON("/api/user/refills"),
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: () => fetchJSON("/api/settings"),
    staleTime: 5 * 60 * 1000,
  });
}

export function use2FAStatus() {
  return useQuery({
    queryKey: ["2fa-status"],
    queryFn: () => fetchJSON("/api/user/2fa/status"),
  });
}
