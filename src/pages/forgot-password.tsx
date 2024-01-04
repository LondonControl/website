/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import AuthCard from '@/components/Auth/AuthCard';
import AuthSessionStatus from '@/components/Auth/AuthSessionStatus';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import GuestLayout from '@/layouts/Guest';
import { AppConfig } from '@/utils/AppConfig';

const formSchema = z.object({
  email: z.string().email().toLowerCase(),
});

const ForgotPassword: NextPage = () => {
  const { forgotPassword } = useAuth({
    middleware: 'guest',
    redirectUri: '/dashboard',
  });

  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await forgotPassword({ email: values.email, setErrors, setStatus });

      form.reset();
      toast.success('Password reset email sent successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('Something went wrong, please try again');
    }

    // eslint-disable-next-line no-console
    if (errors) console.log(errors);
  };

  return (
    <GuestLayout>
      <Meta
        title={`Forgot Password | ${AppConfig.site_name}`}
        description={AppConfig.description}
      />

      <AuthCard>
        <div className="mb-4 text-sm text-gray-600">
          Forgot your password? No problem. Just let us know your email address
          and we will email you a password reset link that will allow you to
          choose a new one.
        </div>

        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={status} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  );
};

export default ForgotPassword;
