'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import UsersContent from './users-content';

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /><p className="mt-2 text-gray-400">Carregando...</p></div>}>
      <UsersContent />
    </Suspense>
  );
} 