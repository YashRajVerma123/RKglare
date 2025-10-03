
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Bulletin, getBulletinClient } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { updateBulletinAction } from '@/app/actions/bulletin-actions';
import Image from 'next/image';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  coverImage: z.string().url('Please enter a valid image URL.'),
});

type PageProps = {
  params: { id: string };
};

export default function EditBulletinPage({ params }: PageProps) {
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

  useEffect(() => {
    const fetchBulletin = async () => {
      setLoading(true);
      const fetchedBulletin = await getBulletinClient(id);
      if (fetchedBulletin) {
        setBulletin(fetchedBulletin);
        form.reset(fetchedBulletin);
      }
      setLoading(false);
    }
    if (id) {
        fetchBulletin();
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

  if (!bulletin) {
      return notFound();
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const result = await updateBulletinAction(bulletin!.id, values);
        if (result.error) throw new Error(result.error);
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

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
            </Button>
        </div>
        <Card className="glass-card max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Bulletin</CardTitle>
                <CardDescription>Make changes to your daily bulletin below.</CardDescription>
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
                              <Input placeholder="Daily Market Wrap-Up" {...field} />
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
                              <Textarea placeholder="Markets closed mixed today..." {...field} rows={4} />
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
                              <Input placeholder="https://picsum.photos/1200/800" {...field} />
                          </FormControl>
                           {form.getValues('coverImage') && (
                            <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                                <Image src={form.getValues('coverImage')} alt="Cover preview" fill objectFit="cover" />
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
