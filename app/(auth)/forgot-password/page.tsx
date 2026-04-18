'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  return (
    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2a5080] shadow-lg">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#1e3a5f]">
          Lupa Password
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground px-6">
          Masukkan email Anda untuk menerima instruksi pengaturan ulang password.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8 pt-4">
        <form action={formAction} className="space-y-5">
          {state?.message && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${
              state.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
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

          <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white font-medium shadow-lg shadow-blue-900/20 transition-all duration-200"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Instruksi'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm text-[#1e3a5f] hover:underline font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Masuk
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © 2026 SD Negeri 2 Kalierang. Hak cipta dilindungi.
        </p>
      </CardContent>
    </Card>
  );
}
