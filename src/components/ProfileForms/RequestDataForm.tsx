import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Alert from '@/components/Alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/lib/axios';

const RequestDataForm = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  if (!user) return null;

  const handleRequestData = async (event: any) => {
    event.preventDefault();
    await axios
      .get(`/api/user/data/download`)
      .then(() => toast.success('Data download requested successfully!'))
      .catch(() => toast.error('Something went wrong, please try again!'));
    setButtonLoading(false);
  };

  return (
    <div className="space-y-4">
      <Alert type="info">
        Please allow a minimum of 24 hours for this request to be processed.
      </Alert>

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={buttonLoading}
          onClick={(event) => {
            setButtonLoading(true);
            handleRequestData(event);
          }}
        >
          {buttonLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Request Download
        </Button>
      </div>
    </div>
  );
};

export default RequestDataForm;
