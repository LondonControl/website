/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import AuthCard from '@/components/Auth/AuthCard';
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
    name: z.string().min(2),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine((values) => {
    return values.password === values.passwordConfirmation;
  });

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
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.passwordConfirmation,
        setErrors,
        setStatus: () => {},
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }

    // eslint-disable-next-line no-console
    if (errors) console.log(errors);
  };

  return (
    <GuestLayout>
      <Meta
        title={`Register | ${AppConfig.site_name}`}
        description={AppConfig.description}
      />

      <AuthCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>

                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Register</Button>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  );
};

export default Register;
