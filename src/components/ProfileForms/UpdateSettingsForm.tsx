import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
  communication_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(true).optional(),
  security_emails: z.boolean().default(true),
});

const UpdateSettingsForm = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const [errors, setErrors] = useState<any>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communication_emails: false,
      marketing_emails: true,
      security_emails: true,
    },
  });

  useEffect(() => {
    if (user !== undefined) {
      form.setValue(
        'communication_emails',
        user.settings?.emails?.communication,
      );
      form.setValue('marketing_emails', user.settings?.emails?.marketing);
      form.setValue('security_emails', user.settings?.emails?.security);
    }
  }, [user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrors([]);
    await csrf();
    axios
      .put('/api/settings', {
        emails: {
          communication: values.communication_emails,
          marketing: values.marketing_emails,
          security: true,
        },
      })
      .then(() => toast.success('Settings updated successfully!'))
      .catch((error) => {
        if (error.response.status !== 422) throw error;
        setErrors(error.response.data.errors);
      });
    if (errors.length > 0)
      toast.error('Something went wrong, please try again!');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="communication_emails"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-5">
              <div className="space-y-1">
                <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Communication emails
                </FormLabel>
                <FormDescription className="text-sm text-foreground/70">
                  Receive emails about your account activity.
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
          name="marketing_emails"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-5">
              <div className="space-y-1">
                <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Marketing emails
                </FormLabel>
                <FormDescription className="text-sm text-foreground/70">
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
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-5">
              <div className="space-y-1">
                <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Security emails
                </FormLabel>
                <FormDescription className="text-sm text-foreground/70">
                  Receive emails about your account activity and security.
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

        <div className="flex justify-end pt-2">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateSettingsForm;
