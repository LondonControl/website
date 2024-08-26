/* eslint-disable import/no-extraneous-dependencies */
import { useState } from 'react';
import { toast } from 'sonner';

import Alert from '@/components/Alert';
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

const DeleteAccountForm = () => {
  const { user, deleteAccount } = useAuth({ middleware: 'auth' });
  const [errors, setErrors] = useState<any>([]);

  if (!user) return null;

  const handleAccountDelete = async (event: any) => {
    event.preventDefault();
    setErrors([]);

    await deleteAccount({ setStatus: () => {}, setErrors });

    if (errors.length > 0) {
      toast.error('Something went wrong, please try again');
    }
  };

  return (
    <section>
      <header>
        <h2 className="text-lg font-medium text-primary">Delete Account</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Use the button below to delete your user account and all identifiable
          information.
        </p>
      </header>

      <div className="mt-6">
        <Alert type="caution">
          <strong>Warning</strong> this is destructive and cannot be undone.
        </Alert>
      </div>

      <Separator className="mt-6" />

      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
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
              <AlertDialogAction
                onClick={(event) => handleAccountDelete(event)}
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};

export default DeleteAccountForm;
