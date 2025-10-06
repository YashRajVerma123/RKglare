
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
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { getNextDiaryChapterNumber } from '@/lib/data';
import { addDiaryEntryAction } from '@/app/actions/diary-actions';
import { compressImage } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  date: z.string().min(1, 'Date is required.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  icon: z.string().min(1, 'Please upload an icon.'),
});

export default function CreateDiaryEntryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nextChapter, setNextChapter] = useState<number | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      content: '',
      icon: '',
    },
  });
  
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
    const fetchNextChapter = async () => {
        const num = await getNextDiaryChapterNumber();
        setNextChapter(num);
    };
    fetchNextChapter();
  }, [user, isAdmin, loading, router]);
  
  if (loading || !isAdmin || nextChapter === null) {
      return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB check
          toast({ title: "Icon Too Large", description: "Please upload an icon smaller than 5MB.", variant: "destructive" });
          return;
      }
      try {
        const compressedBase64 = await compressImage(file);
        setIconPreview(compressedBase64);
        form.setValue('icon', compressedBase64);
      } catch (error) {
        toast({ title: "Error Compressing Image", description: "Could not process the image. Please try another.", variant: "destructive" });
      }
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const result = await addDiaryEntryAction(values);
        if (result.error) throw new Error(result.error);

        toast({
            title: 'Diary Entry Created!',
            description: `Chapter ${result.chapter} has been successfully published.`,
        });
        router.push(`/diary/${result.chapter}`);
    } catch (error) {
       toast({
        title: 'Error Creating Entry',
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
                <CardTitle>Create Diary Entry - Chapter {nextChapter}</CardTitle>
                <CardDescription>Fill out the details below to add a new chapter to your diary.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="A New Beginning" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input placeholder="July 2024" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormItem>
                          <FormLabel>Chapter Icon</FormLabel>
                          <FormControl>
                              <div className="flex items-center gap-4">
                                  {iconPreview ? (
                                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border bg-muted">
                                          <Image src={iconPreview} alt="Icon preview" layout="fill" objectFit="cover" />
                                      </div>
                                  ) : (
                                     <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                        <ImageIcon className="h-8 w-8" />
                                     </div>
                                  )}
                                  <Input 
                                      id="icon-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageChange}
                                      ref={fileInputRef}
                                      className="hidden"
                                  />
                                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Icon
                                  </Button>
                              </div>
                          </FormControl>
                          <FormField
                              control={form.control}
                              name="icon"
                              render={({ field }) => <FormMessage {...field} />}
                          />
                      </FormItem>
                    <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Write your entry here. You can use HTML for formatting." {...field} rows={15} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Publishing...' : 'Publish Entry'}
                    </Button>
                </form>
              </Form>
            </CardContent>
        </Card>
    </div>
  );
}
