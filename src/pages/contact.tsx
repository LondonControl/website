import type { NextPage } from 'next';
import Link from 'next/link';
import type { FormEventHandler } from 'react';
import { useState } from 'react';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const Contact: NextPage<Props> = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [secondName, setSecondName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
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

  const submitForm: FormEventHandler = async (event) => {
    event.preventDefault();

    if (!agreed) return;

    try {
      await sendContactForm({
        firstName,
        secondName,
        email,
        subject,
        message,
      });

      setFirstName('');
      setSecondName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
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

        <form
          onSubmit={submitForm}
          className="mx-auto mt-16 max-w-xl tablet:mt-20"
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 tablet:grid-cols-2">
            <div>
              <Label htmlFor="email">First name</Label>

              <Input
                id="first-name"
                type="text"
                value={firstName}
                className="mt-1 block w-full"
                onChange={(event) => setFirstName(event.target.value)}
                required
                autoFocus
              />

              {/* <InputError messages={errors.email} className="mt-2" /> */}
            </div>

            <div>
              <Label htmlFor="second-name">Second name</Label>

              <Input
                id="second-name"
                type="text"
                value={secondName}
                className="mt-1 block w-full"
                onChange={(event) => setSecondName(event.target.value)}
                required
              />

              {/* <InputError messages={errors.email} className="mt-2" /> */}
            </div>

            <div className="tablet:col-span-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                value={email}
                className="mt-1 block w-full"
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              {/* <InputError messages={errors.email} className="mt-2" /> */}
            </div>

            <div className="tablet:col-span-2">
              <Label htmlFor="subject">Subject</Label>

              <Input
                id="subject"
                type="text"
                value={subject}
                className="mt-1 block w-full"
                onChange={(event) => setSubject(event.target.value)}
                required
              />

              {/* <InputError messages={errors.email} className="mt-2" /> */}
            </div>

            <div className="tablet:col-span-2">
              <label
                htmlFor="message"
                className="block text-sm font-semibold leading-6 text-gray-900"
              >
                Message
              </label>

              <div className="mt-2.5">
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 tablet:text-sm tablet:leading-6"
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>
            </div>

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
          </div>

          <div className="mt-10">
            <Button type="submit" disabled={!agreed}>
              Let&apos;s talk
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Contact;
