/* eslint-disable import/no-extraneous-dependencies */
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, HelpCircle, MessageSquare } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const formSchema = z.object({
  firstName: z.string().min(2).max(50),
  secondName: z.string().min(2).max(50),
  email: z.string().email(),
  addons: z.string().refine((value) => ['no', 'yes'].includes(value), {
    message: "Please select either 'No' or 'Yes'",
  }),
  subject: z.string().min(2).max(250),
  message: z.string().min(2),
});

const contactLinks = [
  {
    icon: Globe,
    label: 'Community forum',
    description: 'Browse answers and post questions',
    href: 'https://forum.londoncontrol.com',
    external: true,
    cta: 'Visit forum →',
  },
  {
    icon: MessageSquare,
    label: 'FAQs',
    description: 'Read through commonly asked questions',
    href: '/#faqs',
    external: false,
    cta: 'Browse FAQs →',
  },
];

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
      addons: '',
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
        addons: values.addons,
        subject: values.subject,
        message: values.message,
      });

      form.reset();
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Something went wrong, please try again!');
    }
  };

  return (
    <MainLayout
      meta={
        <Meta
          title={`Contact | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/contact`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-16 tablet:px-6 laptop:px-8 laptop:py-24">
        <div className="grid gap-16 laptop:grid-cols-2 laptop:gap-24">
          {/* Left: heading + context */}
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Contact
            </span>
            <h1 className="mt-4 font-inter text-5xl font-black leading-none tracking-tighter text-foreground tablet:text-6xl laptop:text-7xl">
              Get in
              <br />
              touch
            </h1>

            <div className="my-8 h-px w-16 bg-border" />

            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              Have a question, bug report, or need some help? Fill in the form
              and we&apos;ll get back to you as soon as possible.
            </p>

            {/* Alternative contact channels */}
            <div className="mt-10 space-y-4">
              {contactLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    <item.icon className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    {item.cta}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-6 tablet:p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
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
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="col-span-full tablet:col-span-1">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addons"
                      render={({ field }) => (
                        <FormItem className="col-span-full tablet:col-span-1">
                          <FormLabel>Using unofficial addons?</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger
                                type="button"
                                tabIndex={-1}
                                className="ml-1 cursor-default text-muted-foreground"
                              >
                                <HelpCircle className="size-3.5" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Unofficial addons are third-party plugins or
                                tools not developed or endorsed by London
                                Control.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="yes">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="How can we help?" {...field} />
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
                          <Textarea
                            placeholder="Tell us a little more..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t border-border pt-5">
                    <div className="flex items-start gap-3">
                      <Switch
                        id="privacyPolicyAgree"
                        checked={agreed}
                        onCheckedChange={setAgreed}
                        className="mt-0.5 shrink-0"
                      />
                      <Label
                        htmlFor="privacyPolicyAgree"
                        className="text-sm leading-relaxed text-muted-foreground"
                      >
                        I agree to the{' '}
                        <Link
                          href="/privacy"
                          className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                        >
                          privacy policy
                        </Link>{' '}
                        and have read the{' '}
                        <Link
                          href="/#faqs"
                          className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                        >
                          FAQs
                        </Link>
                        .
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      disabled={!agreed || form.formState.isSubmitting}
                      size="lg"
                      className="mt-5 w-full"
                    >
                      {form.formState.isSubmitting
                        ? 'Sending...'
                        : 'Send message →'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
