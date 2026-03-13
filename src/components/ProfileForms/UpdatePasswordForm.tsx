/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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
import axios, { csrf } from '@/lib/axios';

const formSchema = z
  .object({
    currentPassword: z.string(),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'Passwords must match',
    path: ['passwordConfirmation'],
  });

const UpdatePasswordForm = () => {
  const [errors, setErrors] = useState<any>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrors([]);
    await csrf();
    axios
      .put('/api/password', {
        current_password: values.currentPassword,
        password: values.password,
        password_confirmation: values.passwordConfirmation,
      })
      .then(() => toast.success('Password updated successfully!'))
      .catch((error) => {
        if (error.response.status !== 422) throw error;
        setErrors(error.response.data.errors);
      });
    if (errors.length > 0)
      toast.error('Something went wrong, please try again!');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Current password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className="font-jetbrains"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                New password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className="font-jetbrains"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Confirm new password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className="font-jetbrains"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdatePasswordForm;
