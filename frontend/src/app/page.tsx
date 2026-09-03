'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Home() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    apiFetch('/health')
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Could not reach backend'));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">Backend says: {status}</h1>
    </main>
  );
}
