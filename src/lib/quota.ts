let quotaUsageLog: { timestamp: number; endpoint: string; cost: number }[] = [];

export const QUOTA_COSTS = {
  search: 100,
  videos: 1,
  channels: 1,
};

export function logQuotaUsage(endpoint: string, cost: number = 100) {
  const timestamp = Date.now();
  quotaUsageLog.push({ timestamp, endpoint, cost });

  // Keep only last 24 hours
  const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
  quotaUsageLog = quotaUsageLog.filter((log) => log.timestamp > oneDayAgo);
}

export function getQuotaUsage() {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentLogs = quotaUsageLog.filter((log) => log.timestamp > oneDayAgo);

  const totalCost = recentLogs.reduce((sum, log) => sum + log.cost, 0);
  const endpointBreakdown = recentLogs.reduce(
    (acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + log.cost;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalQuotaUsed: totalCost,
    requestCount: recentLogs.length,
    endpointBreakdown,
    logs: recentLogs.slice(-50), // Last 50 requests
  };
}
