
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  isLink?: boolean;
}

const Logo = ({ isLink = true }: LogoProps) => {
  const className = "text-3xl font-bold font-headline tracking-tighter text-foreground transition-opacity hover:opacity-80";
  const content = (
    <>
      Glare<span className="text-primary animate-pulse-dot">.</span>
    </>
  );

  if (isLink) {
    return (
      <Link href="/" className={className}>
        {content}
      </Link>
    );
  }
  
  return <div className={className}>{content}</div>;
};

export default Logo;
