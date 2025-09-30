
'use server';

// This server action is now deprecated as the PDF generation logic
// has been moved entirely to the client-side in `post-actions.tsx`
// using `jspdf` and `html2canvas`. This file is kept for posterity
// but can be safely removed in the future.

export async function generatePdf(title: string, htmlContent: string) {
  return { success: true, message: "This action is deprecated. PDF generation now occurs on the client." };
}
