
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { subscribeToNewsletter } from '@/app/actions/newsletter-actions';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function NewsletterForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await subscribeToNewsletter(values.email);
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Subscription Successful!',
        description: "Thanks for subscribing. You're on the list!",
      });
      form.reset();

    } catch (error) {
       toast({
        title: 'Subscription Failed',
        description: (error as Error).message || 'Could not subscribe. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field} 
                    className="h-14 pl-5 pr-36 rounded-full text-base"
                  />
                  <Button 
                    type="submit" 
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full h-11 px-6"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="pl-5" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
