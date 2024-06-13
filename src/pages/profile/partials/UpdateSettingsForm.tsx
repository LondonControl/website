import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import axios, { csrf } from '@/lib/axios';

const formSchema = z.object({
  marketing_emails: z.boolean().default(true).optional(),
  security_emails: z.boolean().default(true),
});

const UpdateSettingsForm = () => {
  const { user } = useAuth({
    middleware: 'auth',
  });

  const [errors, setErrors] = useState<any>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketing_emails: true,
      security_emails: true,
    },
  });

  // TODO: replace this with useEffect.
  if (!user) return null;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrors([]);

    await csrf();

    axios
      .put('/api/settings', {
        marketing_emails: values.marketing_emails,
        security_emails: values.security_emails,
      })
      .then(() => toast.success('Profile updated successfully!'))
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors(error.response.data.errors);
      });

    if (errors.length > 0) {
      toast.error('Something went wrong, please try again!');
    }
  };

  return (
    <section>
      <header>
        <h2 className="text-lg font-medium text-gray-900">
          Settings & Privacy
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Update your account&apos;s settings and privacy information.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="marketing_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Marketing emails</FormLabel>
                  <FormDescription>
                    Receive emails about new products, features, and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="security_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Security emails</FormLabel>
                  <FormDescription>
                    Receive emails about your account security.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                    aria-readonly
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default UpdateSettingsForm;
