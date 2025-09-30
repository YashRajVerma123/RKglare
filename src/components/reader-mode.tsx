
'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface ReaderModeProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const ReaderMode = ({ isOpen, onClose, title, content }: ReaderModeProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] bg-[#FFF4BC] font-reader text-gray-800 transition-opacity duration-500 ease-in-out',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d2c694\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="fixed top-4 right-4 h-12 w-12 rounded-full text-gray-700 hover:bg-black/10 hover:text-black z-[110]"
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Close Reader Mode</span>
      </Button>

      <div className="container mx-auto px-4 py-16 h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <article>
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold !font-reader tracking-tight mb-4 text-gray-900" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                {title}
              </h1>
            </header>
            <div
              className="prose prose-lg lg:prose-xl max-w-none !font-reader text-gray-800 prose-headings:!font-reader prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-gray-900 prose-a:underline prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </article>
        </div>
      </div>
    </div>
  );
};

export default ReaderMode;
