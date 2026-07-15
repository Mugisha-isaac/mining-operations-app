import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDashboardStats, type DashboardStats } from './dashboard.api';
import { useRealtimeSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/card';

const STATS_QUERY_KEY = ['dashboard-stats'];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { socket, connected } = useRealtimeSocket();

  const { data: stats, isLoading } = useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: fetchDashboardStats,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!socket) return;
    const handler = (updated: DashboardStats) => {
      queryClient.setQueryData(STATS_QUERY_KEY, updated);
    };
    // core-service also emits this directly, but incident:created already
    // triggers a refetch (see useIncidentsQuery) - this listener covers
    // any future producer of dashboard:stats-updated without extra wiring.
    socket.on('dashboard:stats-updated', handler);
    return () => {
      socket.off('dashboard:stats-updated', handler);
    };
  }, [socket, queryClient]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Welcome back, {user?.fullName}</h1>
        <p className="text-sm text-stone-500">
          {connected ? 'Live updates connected' : 'Connecting to live updates…'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Workers on shift" value={stats?.workersOnShift} loading={isLoading} />
        <StatCard label="Open incidents" value={stats?.openIncidents} loading={isLoading} tone="warning" />
        <StatCard label="Resolved today" value={stats?.resolvedToday} loading={isLoading} tone="success" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  tone = 'default',
}: {
  label: string;
  value?: number;
  loading: boolean;
  tone?: 'default' | 'warning' | 'success';
}) {
  const toneClass =
    tone === 'warning' ? 'text-amber-600' : tone === 'success' ? 'text-emerald-600' : 'text-stone-900';
  return (
    <Card>
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${toneClass}`}>{loading ? '—' : value}</p>
    </Card>
  );
}
