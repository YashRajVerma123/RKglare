
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Notification, getNotificationClient } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { updateNotificationAction } from '@/app/actions/notification-actions';
import Image from 'next/image';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  image: z.string().url().optional().or(z.literal('')),
});

type PageProps = {
  params: { id: string };
};

export default function EditNotificationPage({ params }: PageProps) {
  const { id } = params;
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
    },
  });

  useEffect(() => {
    const fetchNotification = async () => {
      setLoading(true);
      const fetchedNotification = await getNotificationClient(id);
      if (fetchedNotification) {
        setNotification(fetchedNotification);
        form.reset(fetchedNotification);
      }
      setLoading(false);
    }
    if (id) {
        fetchNotification();
    }
  }, [id, form]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || loading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      );
  }

  if (!notification) {
      return notFound();
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const result = await updateNotificationAction(notification!.id, values);
        if (result.error) throw new Error(result.error);
        toast({
            title: 'Notification Updated!',
            description: 'Your changes have been saved successfully.',
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
        <Card className="glass-card max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Notification</CardTitle>
                <CardDescription>Make changes to your notification below.</CardDescription>
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
                           {form.getValues('image') && (
                            <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                                <Image src={form.getValues('image')!} alt="Image preview" fill objectFit="cover" />
                            </div>
                           )}
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                </form>
              </Form>
            </CardContent>
        </Card>
    </div>
  );
}
