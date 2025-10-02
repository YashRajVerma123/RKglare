
import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh] text-center">
      <div className="relative glass-card p-12 rounded-2xl">
        <div className="flex justify-center mb-6">
          <WifiOff className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-headline font-bold mb-4">You're Offline</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          It seems you've lost your connection. Please check your internet and try again.
        </p>
         <Link href="/" className="mt-8 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
