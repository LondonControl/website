import { Transition } from '@headlessui/react';
import type { FormEventHandler } from 'react';
import React, { useState } from 'react';

import InputError from '@/components/Inputs/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios, { csrf } from '@/lib/axios';

const UpdatePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');

  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState<number | null>(null);

  const submitForm: FormEventHandler = async (event) => {
    event.preventDefault();

    await csrf();

    setErrors([]);
    setStatus(null);

    axios
      .put('/api/password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })
      .then((response) => setStatus(response.status))
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors(error.response.data.errors);
      });
  };

  return (
    <section>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Update Password</h2>

        <p className="mt-1 text-sm text-gray-600">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </header>

      <form onSubmit={submitForm} className="mt-6 space-y-6">
        {/* Current password */}
        <div>
          <Label htmlFor="current_password">Current Password</Label>
          <Input
            id="current_password"
            type="password"
            className="mt-1 block w-full"
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            autoComplete="current_password"
          />

          <InputError messages={errors.current_password} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            className="mt-1 block w-full"
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new_password"
          />

          <InputError messages={errors.password} className="mt-2" />
        </div>

        <div>
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <Input
            id="password_confirmation"
            type="password"
            className="mt-1 block w-full"
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            autoComplete="password_confirmation"
          />

          <InputError
            messages={errors.password_confirmation}
            className="mt-2"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit">Save</Button>

          {status === 200 && (
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

export default UpdatePasswordForm;
