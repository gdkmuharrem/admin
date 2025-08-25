'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { LoginData } from '@/types/auth';
import styles from '@/components/LoginForm.module.css';

interface LoginFormProps {
  onSubmit: SubmitHandler<LoginData>;
  errorMessage?: string;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, errorMessage, isLoading }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  let displayedError: string | null = null;

  if (errorMessage) {
    displayedError = errorMessage;
  } else if (errors.email) {
    displayedError = errors.email.message || null;
  } else if (!errors.email && errors.password) {
    displayedError = errors.password.message || null;
  }

  const showError = Boolean(displayedError);

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className={styles.title}>Admin Girişi</h1>

      <div className={styles.formGroup}>
        <input
          id="email"
          type="email"
          placeholder="Email"
          autoComplete="username"
          {...register('email', {
            required: 'Email gerekli',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Geçerli email giriniz',
            },
          })}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby="email-error"
        />
        <UserIcon className={styles.icon} />
      </div>

      <div className={styles.formGroup}>
        <input
          id="password"
          type="password"
          placeholder="Parola"
          autoComplete="current-password"
          {...register('password', {
            required: 'Parola gerekli',
            minLength: {
              value: 6,
              message: 'Parola en az 6 karakter olmalı',
            },
          })}
          className={`${styles.input} ${
            errors.password && !errors.email ? styles.inputError : ''
          }`}
          aria-invalid={errors.password && !errors.email ? 'true' : 'false'}
          aria-describedby="password-error"
        />
        <LockClosedIcon className={styles.icon} />
      </div>

      <div
        className={`${styles.errorContainer} ${showError ? styles.visible : ''}`}
        role="alert"
        aria-live="assertive"
      >
        <p>{displayedError}</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={styles.button}
        style={{ marginTop: showError ? '1rem' : '0rem' }}
      >
        {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
    </form>
  );
}
