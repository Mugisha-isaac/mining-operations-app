import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission, Permission } from '@/lib/permissions';
import {
  useCreateIncident,
  useIncidentsQuery,
  useUpdateIncidentStatus,
} from './useIncidents';
import { nextStatusFor, type IncidentStatus } from './incidents.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

const STATUS_TONE: Record<IncidentStatus, 'warning' | 'info' | 'success'> = {
  REPORTED: 'warning',
  UNDER_REVIEW: 'info',
  RESOLVED: 'success',
};

const STATUS_LABEL: Record<IncidentStatus, string> = {
  REPORTED: 'Reported',
  UNDER_REVIEW: 'Under review',
  RESOLVED: 'Resolved',
};

export function IncidentsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { data: incidents, isLoading } = useIncidentsQuery();
  const updateStatus = useUpdateIncidentStatus();

  const canCreate = hasPermission(role, Permission.INCIDENT_CREATE);
  const canAdvanceStatus = hasPermission(role, Permission.INCIDENT_UPDATE_STATUS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">Safety incidents</h1>
        {canCreate && <ReportIncidentDialog />}
      </div>

      {isLoading && <p className="text-sm text-stone-400">Loading incidents…</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {incidents?.map((incident) => {
          const next = nextStatusFor(incident.status);
          return (
            <Card key={incident.id} className="flex flex-col gap-3">
              <img
                src={incident.photoUrl}
                alt={incident.title}
                className="h-36 w-full rounded-md object-cover"
              />
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-stone-900">{incident.title}</h3>
                <Badge tone={STATUS_TONE[incident.status]}>{STATUS_LABEL[incident.status]}</Badge>
              </div>
              <p className="text-sm text-stone-600">{incident.description}</p>
              <p className="text-xs text-stone-400">
                {incident.location} · reported by {incident.reportedByEmail}
              </p>
              {canAdvanceStatus && next && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-auto"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: incident.id, status: next })}
                >
                  Mark as {STATUS_LABEL[next]}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {incidents?.length === 0 && (
        <p className="text-sm text-stone-400">No incidents reported yet.</p>
      )}
    </div>
  );
}

function ReportIncidentDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const createIncident = useCreateIncident();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!photo) return;
    createIncident.mutate(
      { title, description, location, photo },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
          setLocation('');
          setPhoto(null);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Report incident</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Report a safety incident</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full rounded-md border border-stone-300 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <Label htmlFor="photo">Photo</Label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createIncident.isPending}>
              {createIncident.isPending ? 'Submitting…' : 'Submit report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
