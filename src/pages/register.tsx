/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import AuthCard from '@/components/Auth/AuthCard';
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

const formSchema = z
  .object({
    name: z.string().min(2),
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

const Register: NextPage = () => {
  const { register } = useAuth({
    middleware: 'guest',
    redirectUri: '/',
  });

  const [errors, setErrors] = useState<any>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await register({
      name: values.name,
      email: values.email,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
      setErrors,
      setStatus: () => {},
    });

    if (errors.length > 0) {
      toast.error('Something went wrong, please try again');
    }
  };

  return (
    <GuestLayout>
      <Meta
        title={`Register | ${AppConfig.site_name}`}
        description={AppConfig.description}
      />

      <AuthCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>

                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>

                  <FormMessage />

                  <InputError
                    messages={errors?.filter(
                      (error: ErrorInput) => error.source?.pointer === '/name'
                    )}
                    className="mt-2"
                  />
                </FormItem>
              )}
            />

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
                      (error: ErrorInput) => error.source?.pointer === '/email'
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
                      (error: ErrorInput) =>
                        error.source?.pointer === '/password'
                    )}
                    className="mt-2"
                  />
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

                  <InputError
                    messages={errors?.filter(
                      (error: ErrorInput) =>
                        error.source?.pointer === '/password_confirmation'
                    )}
                    className="mt-2"
                  />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Button variant="link" asChild>
                <Link href="/login">Have an account?</Link>
              </Button>

              <Button type="submit" className="ml-2">
                Register
              </Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  );
};

export default Register;
