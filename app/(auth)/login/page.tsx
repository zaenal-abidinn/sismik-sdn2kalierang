'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2a5080] shadow-lg">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#1e3a5f]">
          Sistem Akademik
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          SD Negeri 2 Kalierang
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8 pt-4">
        <form action={formAction} className="space-y-5">
          {state?.message && !state.success && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@sekolah.id"
                required
                className="pl-10 h-11"
              />
            </div>
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password"
                required
                className="pl-10 h-11"
              />
            </div>
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-xs text-[#1e3a5f] hover:underline font-medium"
              >
                Lupa password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white font-medium shadow-lg shadow-blue-900/20 transition-all duration-200"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Belum punya akun? </span>
          <Link href="/register" className="text-[#1e3a5f] hover:underline font-semibold">
            Daftar Sekarang
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 SD Negeri 2 Kalierang. Hak cipta dilindungi.
        </p>
      </CardContent>
    </Card>
  );
}
