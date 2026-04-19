'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
}

export function PrintButton({ variant = 'outline', className }: PrintButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={() => window.print()}
      className={className}
    >
      <Printer className="mr-2 h-4 w-4" />
      Cetak
    </Button>
  );
}
