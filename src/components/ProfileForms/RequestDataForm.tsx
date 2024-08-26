import Alert from '@/components/Alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

const RequestDataForm = () => {
  const { user } = useAuth({
    middleware: 'auth',
  });

  if (!user) return null;

  // const handleRequestData = async (event: any) => {
  //   event.preventDefault();

  //   await csrf();

  //   await axios
  //     .get(`/api/user/data/download`)
  //     .then(() => {
  //       toast.success('Data download requested successfully!');
  //     })
  //     .catch(() => {
  //       toast.error('Something went wrong, please try again!');
  //     });
  // };

  return (
    <>
      <section>
        <header>
          <h2 className="text-lg font-medium text-primary">Download Data</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Use the button below to download all identifiable information
            (website only).
          </p>
        </header>
      </section>

      <div className="mt-6">
        <Alert type="info">
          Please allow a minimum of 24 hours for this request to be processed.
        </Alert>
      </div>

      <Separator className="mt-6" />

      <div className="mt-6 flex justify-end">
        <Button disabled>Request Download</Button>
      </div>
    </>
  );
};

export default RequestDataForm;
