/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const formSchema = z.object({
  firstName: z.string().min(2).max(50),
  secondName: z.string().min(2).max(50),
  email: z.string().email(),
  subject: z.string().min(2).max(250),
  message: z.string().min(2),
});

const Contact: NextPage<Props> = () => {
  const [agreed, setAgreed] = useState<boolean>(false);

  const sendContactForm = async (data: any) =>
    fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to send message');

      return res.json();
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      secondName: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!agreed) return;

    try {
      setAgreed(false);

      await sendContactForm({
        firstName: values.firstName,
        secondName: values.secondName,
        email: values.email,
        subject: values.subject,
        message: values.message,
      });

      form.reset();
      toast.success('Message sent successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('Something went wrong, please try again');
    }
  };

  return (
    <MainLayout
      meta={
        <Meta
          title={`Contact | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl laptop:mt-6">
          Get in touch
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto mt-16 max-w-xl space-y-6 tablet:mt-20"
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>

                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second name</FormLabel>

                  <FormControl>
                    <Input placeholder="Second name" {...field} />
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>

                  <FormControl>
                    <Input placeholder="Subject" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>

                  <FormControl>
                    <Textarea placeholder="Message" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 sm:col-span-2">
              <Switch
                id="privacyPolicyAgree"
                checked={agreed}
                onCheckedChange={setAgreed}
              />
              <Label htmlFor="privacyPolicyAgree">
                By selecting this, you agree to our{' '}
                <Link
                  href="/privacy"
                  className="font-semibold text-gray-900 hover:underline"
                >
                  privacy policy
                </Link>
                .
              </Label>
            </div>

            <Button type="submit" disabled={!agreed}>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

export default Contact;
