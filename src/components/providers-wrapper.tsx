// src/components/providers-wrapper.tsx
'use client';

import { ClientProviders } from "@/components/client-providers";
import { Analytics } from "@vercel/analytics/react";

export default function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics />
      <ClientProviders>{children}</ClientProviders>
    </>
  );
}
