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
import { useAuth } from '@/hooks/useAuth';

const DeleteAccountForm = () => {
  const { user, deleteAccount } = useAuth({ middleware: 'auth' });
  const [errors, setErrors] = useState<any>([]);

  if (!user) return null;

  const handleAccountDelete = async (event: any) => {
    event.preventDefault();
    setErrors([]);
    await deleteAccount({ setStatus: () => {}, setErrors });
    if (errors.length > 0)
      toast.error('Something went wrong, please try again');
  };

  return (
    <div className="space-y-4">
      <Alert type="caution">
        <strong>Warning</strong> — this is destructive and cannot be undone.
      </Alert>

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete account</Button>
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
    </div>
  );
};

export default DeleteAccountForm;
