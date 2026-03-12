/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import axios, { csrf } from '@/lib/axios';

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().toLowerCase(),
});

const UpdateProfileInformationForm = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const [errors, setErrors] = useState<any>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  });

  useEffect(() => {
    if (user !== undefined) {
      form.setValue('name', user.name ?? '');
      form.setValue('email', user.email ?? '');
    }
  }, [user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrors([]);
    await csrf();
    axios
      .put('/api/profile', { name: values.name, email: values.email })
      .then(() => toast.success('Profile updated successfully!'))
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
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Email address
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
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

export default UpdateProfileInformationForm;
