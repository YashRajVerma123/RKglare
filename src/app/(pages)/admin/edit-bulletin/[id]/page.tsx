
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateBulletinAction } from '@/app/actions/bulletin-actions';
import { Bulletin, getBulletinClient } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { BulletinCard } from '@/app/(pages)/bulletin/page';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  coverImage: z.string().url().optional().or(z.literal('')),
});

export default function EditBulletinPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [bulletin, setBulletin] = useState<Bulletin | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      coverImage: '',
    },
  });

  const watchedForm = form.watch();

  useEffect(() => {
    const fetchBulletin = async () => {
      setLoading(true);
      const fetchedBulletin = await getBulletinClient(id);
      if (fetchedBulletin) {
        setBulletin(fetchedBulletin);
        form.reset({
          title: fetchedBulletin.title,
          content: fetchedBulletin.content,
          coverImage: fetchedBulletin.coverImage || '',
        });
      }
      setLoading(false);
    }
    fetchBulletin();
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

  if (!bulletin) {
      return notFound();
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!bulletin) return;
    try {
        await updateBulletinAction(bulletin.id, values);
        toast({
            title: 'Bulletin Updated!',
            description: 'Your changes have been saved successfully.',
        });
        router.push(`/admin`);
    } catch (error) {
       toast({
        title: 'Error Updating Bulletin',
        description: (error as Error).message || 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    }
  }

  const previewBulletin: Bulletin = {
      id: bulletin.id,
      publishedAt: bulletin.publishedAt,
      ...watchedForm,
      coverImage: watchedForm.coverImage || 'https://picsum.photos/1200/800',
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
            </Button>
        </div>
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Edit Bulletin</CardTitle>
                <CardDescription>Make changes to your bulletin below.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Daily Market Wrap-up" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Markets closed mixed today..." {...field} rows={5} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="coverImage"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                <Input placeholder="https://example.com/image.png" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                    </form>
                    </Form>
                    <div className="space-y-4">
                        <Label>Live Preview</Label>
                        <BulletinCard bulletin={previewBulletin} index={0} />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
