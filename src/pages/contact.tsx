import { Switch } from '@headlessui/react';
import classNames from 'classnames';
import type { NextPage } from 'next';
import type { FormEventHandler } from 'react';
import { useState } from 'react';

import Input from '@/components/Inputs/Input';
import Label from '@/components/Inputs/Label';
import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const Contact: NextPage<Props> = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [secondName, setSecondName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  // const [message, setMessage] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);

  const submitForm: FormEventHandler = async (event) => {
    event.preventDefault();
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
                isFocused={true}
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
                isFocused={true}
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
                isFocused={true}
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
                isFocused={true}
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
                  defaultValue={''}
                />
              </div>
            </div>

            <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
              <div className="flex h-6 items-center">
                <Switch
                  checked={agreed}
                  onChange={setAgreed}
                  className={classNames(
                    agreed ? 'bg-gray-900' : 'bg-gray-200',
                    'flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900'
                  )}
                >
                  <span className="sr-only">Agree to policies</span>
                  <span
                    aria-hidden="true"
                    className={classNames(
                      agreed ? 'translate-x-3.5' : 'translate-x-0',
                      'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </div>
              <Switch.Label className="text-sm leading-6 text-gray-600">
                By selecting this, you agree to our{' '}
                <a
                  href="#"
                  className="font-semibold text-gray-900 hover:underline"
                >
                  privacy&nbsp;policy
                </a>
                .
              </Switch.Label>
            </Switch.Group>
          </div>
          <div className="mt-10">
            <button
              type="submit"
              className="block w-full rounded-md bg-gray-900 px-3.5 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Let&apos;s talk
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Contact;
