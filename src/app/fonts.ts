
import { Space_Grotesk, Work_Sans, Dancing_Script, Nunito } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  weight: '700'
});

export const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: '300'
});
