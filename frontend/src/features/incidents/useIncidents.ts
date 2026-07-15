import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createIncident, fetchIncidents, updateIncidentStatus, type Incident } from './incidents.api';
import { useRealtimeSocket } from '@/lib/socket';

export const INCIDENTS_QUERY_KEY = ['incidents'];

export function useIncidentsQuery() {
  const queryClient = useQueryClient();
  const { socket } = useRealtimeSocket();

  // Live update: a socket.io event pushed by core-service the moment
  // ANY session on this tenant reports an incident. We just invalidate the
  // query so TanStack Query refetches - no manual cache surgery needed.
  useEffect(() => {
    if (!socket) return;
    const handler = (incident: Incident) => {
      queryClient.setQueryData<Incident[]>(INCIDENTS_QUERY_KEY, (current) =>
        current ? [incident, ...current.filter((i) => i.id !== incident.id)] : [incident],
      );
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    };
    socket.on('incident:created', handler);
    return () => {
      socket.off('incident:created', handler);
    };
  }, [socket, queryClient]);

  return useQuery({ queryKey: INCIDENTS_QUERY_KEY, queryFn: fetchIncidents });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Incident['status'] }) =>
      updateIncidentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
