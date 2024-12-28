import { AppWindow } from 'lucide-react';
import router from 'next/router';
import Moment from 'react-moment';
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
import type UserToken from '@/interfaces/UserToken';
import axios, { fetcher } from '@/lib/axios';

const ActiveSessionsForm = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const { data, error } = useSWR('/api/tokens', fetcher);

  if (!user) return null;

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  const logoutSession = async (
    event: any,
    sessionId: string,
    isToken: boolean = false,
  ) => {
    event.preventDefault();

    await axios
      .post(!isToken ? '' : `/api/tokens/${sessionId}/revoke`)
      .then(() => {
        toast.success('Session logged out successfully!');
        router.push('/profile#sessions');
      })
      .catch(() => {
        toast.error('Something went wrong');
        router.push('/profile#sessions');
      });
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
            {data?.data.map((userToken: UserToken) => (
              <li
                key={userToken.id}
                className="flex justify-between gap-x-6 py-5"
              >
                <div className="flex min-w-0 gap-x-4">
                  <AppWindow strokeWidth={1.5} className="size-10" />

                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-medium text-primary">
                      {userToken.name}
                    </p>

                    {userToken.last_used_at && (
                      <p className="text-xs text-muted-foreground">
                        Last used{' '}
                        <Moment fromNow>{userToken.last_used_at}</Moment>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end">
                  <Button
                    variant="link"
                    className="text-sm text-primary hover:underline"
                    onClick={(event) =>
                      logoutSession(event, userToken.id, true)
                    }
                  >
                    Logout
                  </Button>
                </div>
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
