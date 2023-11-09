import { Transition } from '@headlessui/react';
import type { FormEventHandler } from 'react';
import React, { useEffect, useState } from 'react';

import PrimaryButton from '@/components/Buttons/PrimaryButton';
import Input from '@/components/Inputs/Input';
import InputError from '@/components/Inputs/InputError';
import Label from '@/components/Inputs/Label';
import { useAuth } from '@/hooks/useAuth';
import axios, { csrf } from '@/lib/axios';

const UpdateProfileInformationForm = () => {
  const { user, resendEmailVerification } = useAuth({ middleware: 'auth' });

  const [name, setName] = useState<any>('');
  const [email, setEmail] = useState<any>('');
  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (user !== undefined) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const submitForm: FormEventHandler = async (event) => {
    event.preventDefault();

    await csrf();

    setErrors([]);
    setStatus(null);

    axios
      .put('/api/profile', { name, email })
      .then((response) => setStatus(response.data.status))
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors(error.response.data.errors);
      });
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

      <form onSubmit={submitForm} className="mt-6 space-y-6">
        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            value={name}
            className="mt-1 block w-full"
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
          />
          <InputError messages={errors.email} className="mt-2" />
        </div>
        {/* Email Address */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={email}
            className="mt-1 block w-full"
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />

          <InputError messages={errors.email} className="mt-2" />
        </div>

        {user?.must_verify_email && user?.email_verified_at === null && (
          <div>
            <p className="mt-2 text-sm text-gray-800">
              Your email address is unverified.
              <button
                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() =>
                  resendEmailVerification({
                    setStatus,
                    setErrors: () => {},
                  })
                }
              >
                Click here to re-send the verification email.
              </button>
            </p>

            {status === 'verification-link-sent' && (
              <div className="mt-2 text-sm font-medium text-green-600">
                A new verification link has been sent to your email address.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <PrimaryButton>Save</PrimaryButton>

          {status === 'profile-updated' && (
            <Transition
              show={true}
              enterFrom="opacity-0"
              leaveTo="opacity-0"
              className="transition ease-in-out"
            >
              <p className="text-sm text-gray-600">Saved.</p>
            </Transition>
          )}
        </div>
      </form>
    </section>
  );
};

export default UpdateProfileInformationForm;
