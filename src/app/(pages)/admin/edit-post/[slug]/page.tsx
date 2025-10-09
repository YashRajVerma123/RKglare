
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updatePost } from '@/app/actions/post-actions';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Eye, Pencil, Bot, Star } from 'lucide-react';
import Link from 'next/link';
import { Post, getPostClient } from '@/lib/data';
import PostClientPage from '../../../posts/[slug]/post-client-page';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generatePostContent } from '@/ai/flows/post-flow';
import { Separator } from '@/components/ui/separator';
import { compressImage } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  coverImage: z.string().min(1, 'Please upload a cover image.'),
  tags: z.string().min(1, 'Please enter at least one tag.'),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  trendingPosition: z.coerce.number().min(1).max(10).optional().nullable(),
  readTime: z.coerce.number().min(1, 'Read time must be at least 1 minute.'),
  summary: z.string().optional(),
  topic: z.string().optional(), // For AI generation
  premiumOnly: z.boolean().default(false),
  earlyAccess: z.boolean().default(false),
}).refine(data => {
    if (data.trending && !data.trendingPosition) {
        return false;
    }
    return true;
}, {
    message: "Trending Position is required when 'Mark as Trending' is enabled.",
    path: ['trendingPosition'],
});

export default function EditPostPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin, loading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      coverImage: '',
      tags: '',
      featured: false,
      trending: false,
      trendingPosition: undefined,
      readTime: 5,
      summary: '',
      topic: '',
      premiumOnly: false,
      earlyAccess: false,
    },
  });
  
  const isTrending = form.watch('trending');
  const watchedForm = form.watch();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);
  
  useEffect(() => {
    if(slug) {
        getPostClient(slug, user).then(data => {
            if (data) {
                setPost(data);
                form.reset({
                    ...data,
                    tags: data.tags.join(', '),
                });
                setImagePreview(data.coverImage);
            } else {
                toast({ title: 'Error', description: 'Post not found.', variant: 'destructive'});
                router.push('/admin');
            }
        });
    }
  }, [slug, user, form, router, toast]);

  if (loading || !isAdmin || !post) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await compressImage(file);
        setImagePreview(compressedBase64);
        form.setValue('coverImage', compressedBase64);
      } catch (error) {
        toast({ title: "Error Compressing Image", description: "Could not process the image. Please try another.", variant: "destructive" });
      }
    }
  };

  const handleGeneratePost = async () => {
    const topic = form.getValues("topic");
    if (!topic) {
        form.setError("topic", { message: "Please enter a topic to generate the post." });
        return;
    }
    
    setIsGenerating(true);
    try {
        const result = await generatePostContent({ topic });
        form.setValue("title", result.title);
        form.setValue("description", result.description);
        form.setValue("content", result.content);
        form.setValue("tags", result.tags.join(', '));
        form.setValue("coverImage", result.coverImage);
        setImagePreview(result.coverImage);
        toast({ title: "Content Generated!", description: "The AI has generated the post content for you." });
    } catch (e) {
        toast({ title: "Error", description: "Failed to generate post content.", variant: "destructive"});
    } finally {
        setIsGenerating(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const updatedSlug = await updatePost(post!.id, values);
        toast({
            title: 'Post Updated!',
            description: 'Your post has been successfully updated.',
        });
        router.push(`/posts/${updatedSlug}`);
    } catch (error) {
       toast({
        title: 'Error Updating Post',
        description: (error as Error).message || 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    }
  }

  const previewPost: Post = {
      ...post,
      ...watchedForm,
      slug: watchedForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      tags: watchedForm.tags.split(',').map(t => t.trim()),
      author: user!,
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
            </Button>
        </div>
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Edit Post</CardTitle>
                <CardDescription>Make changes to the article below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="write">
                <TabsList className="mb-4">
                  <TabsTrigger value="write"><Pencil className="mr-2 h-4 w-4" />Write</TabsTrigger>
                  <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
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
                                  If selected, this post will appear in the trending section for 1 week.
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
                      {isTrending && (
                          <FormField
                              control={form.control}
                              name="trendingPosition"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Trending Position</FormLabel>
                                  <FormControl>
                                      <Input type="number" placeholder="1" {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">Set the rank (1-10) for this trending post.</p>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      )}
                      <Separator />
                       <div className="space-y-4">
                           <h3 className="text-lg font-medium flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Premium Settings</h3>
                            <FormField
                                control={form.control}
                                name="premiumOnly"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Premium Only</FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                        Subscribers to Glare+ will be the only ones who can view this post.
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
                                name="earlyAccess"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>24-Hour Early Access</FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                        Make this post available to Glare+ subscribers 24 hours before public release.
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
                       </div>
                      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                  </form>
                  </Form>
                </TabsContent>
                <TabsContent value="preview" className="prose dark:prose-invert max-w-none">
                    <PostClientPage post={previewPost} relatedPosts={[]} initialComments={[]} isPreview />
                </TabsContent>
              </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
