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
  const { user, resendEmailVerification } = useAuth({ middleware: 'auth' });

  const [errors, setErrors] = useState<any>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (user !== undefined) {
      form.setValue('name', user.name ?? '');
      form.setValue('email', user.email ?? '');
    }

    console.log(user);
  }, [user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await csrf();

      setErrors([]);

      axios
        .put('/api/profile', { name: values.name, email: values.email })
        .then(() => toast.success('Profile updated successfully'))
        .catch((error) => {
          if (error.response.status !== 422) throw error;

          setErrors(error.response.data.errors);
          toast.error('Something went wrong, please try again');
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('Something went wrong, please try again');
    }

    // eslint-disable-next-line no-console
    if (errors) console.log(errors);
  };

  return (
    <section>
      <header>
        <h2 className="text-lg font-medium text-gray-900">
          Profile Information
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Update your account&apos;s profile information and email address
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
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

          {user?.email_verified_at === null && (
            <div>
              <p className="mt-2 text-sm text-gray-800">
                Your email address is unverified.
                <button
                  className="ml-2 rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => {
                    resendEmailVerification({
                      setStatus: () => {},
                      setErrors,
                    });

                    toast.success('Verification email sent successfully');
                  }}
                >
                  Click here to re-send the verification email.
                </button>
              </p>
            </div>
          )}

          <Button type="submit">Save</Button>
        </form>
      </Form>
    </section>
  );
};

export default UpdateProfileInformationForm;
