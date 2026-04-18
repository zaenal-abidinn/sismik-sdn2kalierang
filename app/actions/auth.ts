'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, resetPasswordSchema } from '@/lib/validations/schemas';
import type { ActionResponse, Profile } from '@/types';

export async function login(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Data tidak valid',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      message: 'Email atau password salah',
    };
  }

  redirect('/dashboard');
}

export async function signUp(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
  };

  const validated = registerSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Data tidak valid',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.full_name,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message || 'Gagal mendaftar',
    };
  }

  return {
    success: true,
    message: 'Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi atau silakan masuk.',
  };
}

export async function resetPassword(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get('email') as string;

  const validated = resetPasswordSchema.safeParse({ email });
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Email tidak valid',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}/auth/callback?next=/dashboard/profile`,
  });

  if (error) {
    return {
      success: false,
      message: error.message || 'Gagal mengirim email reset password',
    };
  }

  return {
    success: true,
    message: 'Email instruksi reset password telah dikirim.',
  };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile;
}
