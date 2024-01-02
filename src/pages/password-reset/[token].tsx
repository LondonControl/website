/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
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

const formSchema = z
  .object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine(
    (values) => {
      return values.password === values.passwordConfirmation;
    },
    {
      message: 'Passwords must match',
      path: ['passwordConfirmation'],
    }
  );

const PasswordReset: NextPage = () => {
  const { query } = useRouter();

  const { resetPassword } = useAuth({ middleware: 'guest' });

  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await resetPassword({
        email: values.email,
        password: values.password,
        password_confirmation: values.passwordConfirmation,
        setErrors,
        setStatus,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('Something went wrong, please try again');
    }

    // eslint-disable-next-line no-console
    if (errors) console.log(errors);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const email = query && query.email ? (query.email as string) : '';

    form.setValue('email', email);
  }, [query.email]);

  return (
    <GuestLayout>
      <Meta
        title={`Reset Password | ${AppConfig.site_name}`}
        description={AppConfig.description}
      />

      <AuthCard>
        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={status} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>

                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Reset password</Button>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  );
};

export default PasswordReset;
