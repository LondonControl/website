/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import AuthCard from '@/components/Auth/AuthCard';
import AuthSessionStatus from '@/components/Auth/AuthSessionStatus';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  email: z.string().email(),
  password: z.string(),
  shouldRemember: z.boolean(),
});

const Login: NextPage = () => {
  const { query } = useRouter();

  const { login } = useAuth({
    middleware: 'guest',
    redirectUri: '/',
  });

  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      shouldRemember: false,
    },
  });

  useEffect(() => {
    const reset = query && query.reset ? (query.reset as string) : '';
    if (reset.length > 0 && errors.length === 0) {
      setStatus(atob(reset));
    } else {
      setStatus(null);
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      login({
        email: values.email,
        password: values.password,
        remember: values.shouldRemember,
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
    toast.error('Something went wrong, please try again');
  };

  return (
    <GuestLayout>
      <Meta
        title={`Login | ${AppConfig.site_name}`}
        description={AppConfig.description}
      />

      <AuthCard>
        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={status} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input type="email" {...field} />
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
                    <Input type="password" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shouldRemember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <div className="space-y-1 leading-none">
                    <FormLabel>Remember me</FormLabel>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                Forgot your password?
              </Link>

              <Button type="submit" className="ml-4">
                Login
              </Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  );
};

export default Login;
