import { Laptop } from 'lucide-react';
import router from 'next/router';
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
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import type BrowserSession from '@/interfaces/BrowserSession';
import axios, { fetcher } from '@/lib/axios';

const ActiveSessionsForm = () => {
  const { user } = useAuth({ middleware: 'auth' });
  // const { data, error } = useSWR('/api/tokens', fetcher);
  const { data, error } = useSWR('/api/sessions', fetcher);

  if (!user) return null;

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  const logoutSession = async (event: any, sessionId: string) => {
    event.preventDefault();

    await axios
      .delete(`/api/sessions/${sessionId}`)
      .then(() => {
        toast.success('Session logged out successfully!');
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => router.push('/profile#sessions'));
  };

  return (
    <section id="active-sessions">
      <header>
        <h2 className="text-lg font-medium text-primary">Active Sessions</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage and logout your active sessions on other browsers and devices.
        </p>
      </header>

      <div className="mt-6">
        <div className="mx-auto space-y-4">
          <ul role="list" className="divide-y divide-gray-100">
            {data?.data.map((browserSession: BrowserSession) => (
              <li
                key={browserSession.id}
                className="flex justify-between gap-x-6 py-5"
              >
                <div className="flex min-w-0 gap-x-4">
                  <Laptop
                    strokeWidth={1.5}
                    className="size-10 text-muted-foreground"
                  />

                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-medium text-primary">
                      {browserSession.agent}
                    </p>

                    <div className="flex">
                      <p className="text-xs text-muted-foreground">
                        {browserSession.ip_address} -{' '}
                        {browserSession.is_current_device ? (
                          <span className="text-green-600">This device</span>
                        ) : (
                          `Last used ${browserSession.last_active}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {!browserSession.is_current_device && (
                  <div className="flex shrink-0 flex-col items-end">
                    <Button
                      variant="link"
                      className="text-sm text-primary hover:underline"
                      onClick={(event) =>
                        logoutSession(event, browserSession.id)
                      }
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="mt-6" />

      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled>Logout All Sessions</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will logout all sessions on
                all browsers and devies.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Logout Sessions</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};

export default ActiveSessionsForm;
