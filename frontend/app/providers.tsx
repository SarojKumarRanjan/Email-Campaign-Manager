'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                {children}
            </NuqsAdapter>
        </QueryClientProvider>
    );
}
