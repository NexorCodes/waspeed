'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import NotificationsContent from './notifications-content';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /><p className="mt-2 text-gray-400">Carregando...</p></div>}>
      <NotificationsContent />
    </Suspense>
  );
} 