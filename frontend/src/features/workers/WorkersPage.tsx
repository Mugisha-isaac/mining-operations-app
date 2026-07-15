import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission, Permission } from '@/lib/permissions';
import { useCheckInWorker, useCheckOutWorker, useCreateWorker, useWorkersQuery } from './useWorkers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

export function WorkersPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { data: workers, isLoading } = useWorkersQuery();
  const checkIn = useCheckInWorker();
  const checkOut = useCheckOutWorker();

  const canCreate = hasPermission(role, Permission.WORKER_CREATE);
  const canToggleShift = hasPermission(role, Permission.WORKER_CHECK_IN_OUT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">Workforce</h1>
        {canCreate && <AddWorkerDialog />}
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Employee code</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              {canToggleShift && <th className="px-4 py-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-stone-400" colSpan={5}>
                  Loading workers…
                </td>
              </tr>
            )}
            {workers?.map((worker) => (
              <tr key={worker.id} className="border-t border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-900">{worker.fullName}</td>
                <td className="px-4 py-3 text-stone-600">{worker.employeeCode}</td>
                <td className="px-4 py-3 text-stone-600">{worker.role ?? '—'}</td>
                <td className="px-4 py-3">
                  {worker.onShift ? (
                    <Badge tone="success">On shift</Badge>
                  ) : (
                    <Badge tone="neutral">Off shift</Badge>
                  )}
                </td>
                {canToggleShift && (
                  <td className="px-4 py-3 text-right">
                    {worker.onShift ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={checkOut.isPending}
                        onClick={() => checkOut.mutate(worker.id)}
                      >
                        Check out
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={checkIn.isPending}
                        onClick={() => checkIn.mutate(worker.id)}
                      >
                        Check in
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AddWorkerDialog() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [role, setRole] = useState('');
  const createWorker = useCreateWorker();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createWorker.mutate(
      { fullName, employeeCode, role: role || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setFullName('');
          setEmployeeCode('');
          setRole('');
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add worker</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Register a new worker</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="employeeCode">Employee code</Label>
            <Input
              id="employeeCode"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role (optional)</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createWorker.isPending}>
              {createWorker.isPending ? 'Saving…' : 'Save worker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
