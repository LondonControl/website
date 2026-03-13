import { Laptop, LogOut } from 'lucide-react';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type BrowserSession from '@/interfaces/BrowserSession';
import axios, { fetcher } from '@/lib/axios';

const ActiveSessionsForm = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const { data, error } = useSWR('/api/sessions', fetcher);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (error) toast.error('Failed to load sessions. Please try again.');
  }, [error]);

  if (!user) return null;
  const logoutSession = async (event: any, sessionId: string) => {
    event.preventDefault();
    setLoadingSessionId(sessionId);
    await axios
      .delete(`/api/sessions/${sessionId}`)
      .then(() => {
        const index = data.data.findIndex(
          (item: BrowserSession) => item.id === sessionId,
        );
        if (index !== -1) data.data.splice(index, 1);
        toast.success('Session logged out successfully!');
      })
      .catch(() => toast.error('Something went wrong'))
      .finally(() => {
        setLoadingSessionId(null);
        router.push('/profile#sessions');
      });
  };

  return (
    <div className="space-y-4">
      <ul
        role="list"
        className="divide-y divide-border rounded-lg border border-border"
      >
        {data?.data.map((browserSession: BrowserSession) => (
          <li
            key={browserSession.id}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                <Laptop
                  strokeWidth={1.5}
                  className="size-4 text-muted-foreground"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {browserSession.agent}
                </p>
                <p className="mt-0.5 font-jetbrains text-xs text-muted-foreground">
                  {browserSession.ip_address}
                  {' · '}
                  {browserSession.is_current_device ? (
                    <span className="font-medium text-emerald-600">
                      This device
                    </span>
                  ) : (
                    `Last active ${browserSession.last_active}`
                  )}
                </p>
              </div>
            </div>

            {!browserSession.is_current_device && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                disabled={loadingSessionId === browserSession.id}
                onClick={(event) => logoutSession(event, browserSession.id)}
              >
                <LogOut className="size-3.5" />
                {loadingSessionId === browserSession.id
                  ? 'Logging out...'
                  : 'Logout'}
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              Logout all
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will logout all sessions on
                all browsers and devices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Logout sessions</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ActiveSessionsForm;
