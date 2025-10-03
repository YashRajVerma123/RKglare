

import { Space_Grotesk, Work_Sans, Dancing_Script, Nunito, Libre_Baskerville } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  weight: '700',
  display: 'swap',
});

export const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: '300',
  display: 'swap',
});

export const libreBaskerville = Libre_Baskerville({
    subsets: ['latin'],
    variable: '--font-libre-baskerville',
    weight: ['400', '700'],
    display: 'swap',
});

export const mainFonts = [
    { name: 'Work Sans', variable: 'font-work-sans', className: workSans.className },
    { name: 'Nunito', variable: 'font-nunito', className: nunito.className },
    { name: 'Libre Baskerville', variable: 'font-libre-baskerville', className: libreBaskerville.className },
];

export const specialFonts = [
    { name: 'Space Grotesk', variable: 'font-space-grotesk', className: spaceGrotesk.className },
    { name: 'Dancing Script', variable: 'font-dancing-script', className: dancingScript.className },
];
