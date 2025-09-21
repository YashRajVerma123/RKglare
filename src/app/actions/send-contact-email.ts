'use server';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

export async function sendContactEmail(values: z.infer<typeof formSchema>) {
  // This is a server action.
  // In a real app, you would use a service like Resend, SendGrid, or Nodemailer to send an email.
  // For this demo, we'll just log the values to the server console to simulate sending.
  
  console.log('Received contact form submission:');
  console.log('Name:', values.name);
  console.log('Email:', values.email);
  console.log('Message:', values.message);
  console.log('---');
  console.log('Simulating sending email to help.lunexblog@gmail.com');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, you would check for success and throw an error on failure
  // For example, with Resend:
  // const { data, error } = await resend.emails.send({
  //   from: 'onboarding@resend.dev',
  //   to: 'help.lunexblog@gmail.com',
  //   subject: `New contact from ${values.name}`,
  //   react: EmailTemplate({ name: values.name, email: values.email, message: values.message })
  // });
  // if (error) {
  //   throw new Error('Failed to send email');
  // }
  
  return { success: true };
}
