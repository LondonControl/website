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
import InputError from '@/components/Inputs/InputError';
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
import type ErrorInput from '@/interfaces/ErrorInput';
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
    setErrors([]);

    await login({
      email: values.email,
      password: values.password,
      remember: values.shouldRemember,
      setErrors,
      setStatus,
    });

    if (errors.length > 0) {
      toast.error('Something went wrong, please try again!');
    }
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

                  <InputError
                    messages={errors?.filter(
                      (error: ErrorInput) => error.source?.pointer === '/email',
                    )}
                    className="mt-2"
                  />
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

                  <InputError
                    messages={errors?.filter(
                      (error: ErrorInput) => error.source?.pointer === '/email',
                    )}
                    className="mt-2"
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shouldRemember"
              render={({ field }) => (
                <FormItem>
                  <div className="flex">
                    <div className="flex w-full flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>

                      <FormLabel>Remember me</FormLabel>
                    </div>

                    <Button variant="link" asChild className="h-4 p-0">
                      <Link href="/forgot-password">Forgot your password?</Link>
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div className="flex items-center justify-end"> */}
            <Button type="submit" className="w-full">
              Login
            </Button>
            {/* </div> */}
          </form>
        </Form>

        <p className="mt-4 text-sm">
          Don&apos;t have an account?{' '}
          <Button variant="link" asChild className="ml-2 h-4 p-0">
            <Link href="/register">Register</Link>
          </Button>
        </p>
      </AuthCard>
    </GuestLayout>
  );
};

export default Login;
