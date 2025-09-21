
import Link from 'next/link';
import Logo from '@/components/logo';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

const Footer = () => {
  return (
    <footer className="bg-background/50 border-t border-border/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-sm">
              Your essential destination for making sense of today. We provide current affairs news for the modern reader, delivering sharp, focused journalism that explains not only what is happening but why it matters.
            </p>
          </div>
          <div className="md:col-span-2"></div>
          <div className="md:col-span-2">
            <h3 className="font-headline text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
           <div className="md:col-span-4">
              <h3 className="font-headline text-lg font-semibold mb-4">Contact</h3>
              <p className="text-sm text-muted-foreground">For any inquiries, please email us at:</p>
              <a href="mailto:help.novablog@gmail.com" className="text-sm text-primary hover:underline">
                help.novablog@gmail.com
              </a>
           </div>
        </div>

        <Separator className="my-8 bg-border/20" />

        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Glare. All rights reserved.</p>
          <p>Made With ❤️ By Yash Raj</p>
          <p>Cutting through the noise, delivering clarity.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
