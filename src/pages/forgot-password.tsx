/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import AuthCard from '@/components/Auth/AuthCard';
import AuthSessionStatus from '@/components/Auth/AuthSessionStatus';
import InputError from '@/components/Inputs/InputError';
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
import type ErrorInput from '@/interfaces/ErrorInput';
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
    setErrors([]);
    await forgotPassword({ email: values.email, setErrors, setStatus });

    if (errors.length > 0) {
      toast.error('Something went wrong, please try again!');

      return;
    }

    form.reset();
    toast.success('Password reset email sent successfully!');
  };

  return (
    <GuestLayout>
      <Meta
        title={`Forgot Password | ${AppConfig.site_name}`}
        description={AppConfig.description}
        canonical={`${AppConfig.site_url}/forgot-password`}
      />

      <AuthCard>
        <div className="mb-4 text-sm text-muted-foreground">
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

                  <InputError
                    messages={errors?.filter(
                      (error: ErrorInput) => error.source?.pointer === '/email',
                    )}
                    className="mt-2"
                  />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  );
};

export default ForgotPassword;
