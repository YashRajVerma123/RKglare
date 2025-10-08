
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getNotificationClient, Notification } from '@/lib/data';
import { updateNotificationAction } from '@/app/actions/notification-actions';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  image: z.string().url().optional().or(z.literal('')),
});

export default function EditNotificationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin, loading } = useAuth();
  const [notification, setNotification] = useState<Notification | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
    },
  });
  
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (id) {
        getNotificationClient(id).then(data => {
            if (data) {
                setNotification(data);
                form.reset(data);
            } else {
                toast({ title: "Error", description: "Notification not found.", variant: "destructive"});
                router.push('/admin');
            }
        });
    }
  }, [id, form, router, toast]);
  
  if (loading || !isAdmin || !notification) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const result = await updateNotificationAction(id, values);
        if (result.error) throw new Error(result.error);

        toast({
            title: 'Notification Updated!',
            description: `The notification has been successfully updated.`,
        });
        router.push(`/admin`);
    } catch (error) {
       toast({
        title: 'Error Updating Notification',
        description: (error as Error).message || 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
            </Button>
        </div>
        <Card className="glass-card max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Notification</CardTitle>
                <CardDescription>Make changes to the notification below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="New Feature Alert!" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Check out our new comment system!" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/image.png" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
              </Form>
            </CardContent>
        </Card>
    </div>
  );
}

    