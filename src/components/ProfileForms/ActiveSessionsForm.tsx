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

const ActiveSessionsForm = () => {
  const { user } = useAuth({ middleware: 'auth' });

  if (!user) return null;

  return (
    <section>
      <header>
        <h2 className="text-lg font-medium text-primary">Browser Sessions</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage and logout your active sessions on other browsers and devices.
        </p>
      </header>

      <div className="mt-6">
        <div>test</div>
      </div>

      <Separator className="mt-6" />

      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Logout Other Sessions</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete Account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};

export default ActiveSessionsForm;
