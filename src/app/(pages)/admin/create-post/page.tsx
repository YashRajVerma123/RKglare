
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addPost } from '@/app/actions/post-actions';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  coverImage: z.string().min(1, 'Please upload a cover image.'),
  tags: z.string().min(1, 'Please enter at least one tag.'),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  readTime: z.coerce.number().min(1, 'Read time must be at least 1 minute.'),
  summary: z.string().optional(),
});

export default function CreatePostPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>('https://picsum.photos/1200/800');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      coverImage: 'https://picsum.photos/1200/800',
      tags: '',
      featured: false,
      trending: false,
      readTime: 5,
      summary: '',
    },
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);
  
  if (loading || !isAdmin) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await toBase64(file);
      setImagePreview(base64);
      form.setValue('coverImage', base64);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
     if (!user) {
        toast({ title: 'Error', description: 'You must be logged in to create a post.', variant: 'destructive' });
        return;
    }
    
    try {
        const newPostSlug = await addPost(values, user.id);
        toast({
            title: 'Post Created!',
            description: 'Your new post has been published successfully.',
        });
        router.push(`/posts/${newPostSlug}`);
    } catch (error) {
       toast({
        title: 'Error Creating Post',
        description: (error as Error).message || 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    }
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
                <CardTitle>Create a New Post</CardTitle>
                <CardDescription>Fill out the details below to publish a new article to your blog.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Post Title</FormLabel>
                        <FormControl>
                            <Input placeholder="The Future of AI" {...field} />
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
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A brief summary of your article..." {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Summary (for AI simulation)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Write a short summary to be shown when a user clicks 'Summarize'." {...field} rows={3} />
                        </FormControl>
                         <p className="text-xs text-muted-foreground">This will be shown after a short delay to simulate AI generation.</p>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Content</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Write your full article here. You can use HTML for formatting." {...field} rows={10} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                            <div className="flex flex-col items-center gap-4">
                                {imagePreview && (
                                <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                    <Image src={imagePreview} alt="Cover image preview" layout="fill" objectFit="cover" />
                                </div>
                                )}
                                <Input 
                                    id="coverImage-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Image
                                </Button>
                            </div>
                        </FormControl>
                         <FormField
                            control={form.control}
                            name="coverImage"
                            render={({ field }) => <FormMessage {...field} />}
                        />
                    </FormItem>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <Input placeholder="AI, Technology, Future" {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Enter a comma-separated list of tags.</p>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="readTime"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Read Time (minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="5" {...field} />
                                </FormControl>
                                 <p className="text-xs text-muted-foreground">Estimated time to read the article.</p>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Feature Post</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                If selected, this post will appear in the featured carousel on the homepage.
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="trending"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Mark as Trending</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                If selected, this post will appear in the trending section on the homepage.
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Publishing...' : 'Publish Post'}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
