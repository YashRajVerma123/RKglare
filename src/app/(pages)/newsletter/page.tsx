
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Mail, Send, TrendingUp, XCircle } from 'lucide-react';
import { subscribeToNewsletter, unsubscribeFromNewsletter, checkSubscriptionStatus } from '@/app/actions/newsletter-actions';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const features = [
    { icon: <TrendingUp className="h-6 w-6" />, text: "Exclusive insights and analysis" },
    { icon: <Mail className="h-6 w-6" />, text: "The week's top stories, delivered to you" },
    { icon: <CheckCircle className="h-6 w-6" />, text: "First look at our upcoming features" },
];

export default function NewsletterPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });
  
  useEffect(() => {
    form.setValue('email', user?.email || '');
    if (user) {
        setIsCheckingStatus(true);
        checkSubscriptionStatus(user.email).then(result => {
            setIsSubscribed(result.isSubscribed);
            setIsCheckingStatus(false);
        });
    } else {
        setIsCheckingStatus(false);
        setIsSubscribed(false);
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await subscribeToNewsletter(values.email, user?.id);
      if (result.error) {
          throw new Error(result.error);
      }
      toast({
        title: 'Subscription Successful!',
        description: "You're now on the list. Keep an eye on your inbox!",
      });
      setIsSubscribed(true);
    } catch (error) {
       toast({
        title: 'Subscription Failed',
        description: (error as Error).message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleUnsubscribe() {
      if (!user) return;
      try {
          const result = await unsubscribeFromNewsletter(user.email);
          if (result.error) {
              throw new Error(result.error);
          }
          toast({
              title: 'Unsubscribed',
              description: 'You have been successfully removed from the newsletter.',
              variant: 'destructive',
          });
          setIsSubscribed(false);
      } catch (error) {
          toast({
              title: 'Unsubscription Failed',
              description: (error as Error).message || 'Could not process your request. Please try again.',
              variant: 'destructive',
          });
      }
  }
  
  const renderContent = () => {
    if (isCheckingStatus) {
        return (
             <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (isSubscribed) {
        return (
             <div className="relative glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-headline font-semibold text-center mb-4">You&apos;re Subscribed!</h2>
                <p className="text-muted-foreground text-center mb-6">
                    Thank you for being a part of our community. You can manage your subscription here.
                </p>
                <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-full h-12" 
                    onClick={handleUnsubscribe}
                    disabled={form.formState.isSubmitting}
                >
                     {form.formState.isSubmitting ? (
                        'Processing...'
                    ) : (
                        <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Unsubscribe
                        </>
                    )}
                </Button>
            </div>
        )
    }

    return (
         <div className="relative glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-headline font-semibold text-center mb-6">Subscribe Now</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="sr-only">Email</FormLabel>
                        <FormControl>
                            <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                {...field}
                                className="h-12 text-base"
                                disabled={!!user}
                             />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" size="lg" className="w-full h-12" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        'Subscribing...'
                    ) : (
                        <>
                        <Send className="mr-2 h-4 w-4" />
                        Get Access
                        </>
                    )}
                    </Button>
                </form>
            </Form>
             <p className="text-xs text-muted-foreground text-center mt-4">We respect your privacy. No spam, ever.</p>
         </div>
    );
  }

  return (
     <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-4">
                Stay Ahead of the Curve<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Join our newsletter to get the most important stories, exclusive analyses, and a look behind the scenes, delivered straight to your inbox every week.
                </p>
                <div className="space-y-4">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {feature.icon}
                            </div>
                            <span className="font-medium">{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                 <div className="absolute inset-0.5 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                 {renderContent()}
            </div>
        </div>
    </div>
  );
}
