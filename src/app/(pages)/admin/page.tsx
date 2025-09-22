

'use client';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Edit, PlusCircle, Trash, Users, BellRing, Image as ImageIcon, Megaphone, User as UserIcon, Upload, LineChart, Mail } from "lucide-react";
import { Post, getPosts, Notification, getNotifications, Bulletin, getBulletins, Author } from "@/lib/data";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePost } from "@/app/actions/post-actions";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addNotificationAction, deleteNotificationAction } from "@/app/actions/notification-actions";
import { addBulletin, deleteBulletin } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { updateAuthorProfile } from "@/app/actions/user-actions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import { sendCustomNewsletter } from "@/app/actions/newsletter-actions";

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const notificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  image: z.string().url().optional().or(z.literal('')),
});

const bulletinSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  coverImage: z.string().url('Please enter a valid image URL.'),
});

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().min(20, 'Bio must be at least 20 characters.'),
  instagramUrl: z.string().url('Please enter a valid Instagram URL.'),
  signature: z.string().min(2, 'Signature must be at least 2 characters.'),
});

const newsletterSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
});


const AdminPage = () => {
    const { user, isAdmin, loading, updateUserProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [allBulletins, setAllBulletins] = useState<Bulletin[]>([]);
    const [isPostDeleteDialogOpen, setPostDeleteDialogOpen] = useState(false);
    const [isNotifDeleteDialogOpen, setNotifDeleteDialogOpen] = useState(false);
    const [isBulletinDeleteDialogOpen, setBulletinDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
    const [bulletinToDelete, setBulletinToDelete] = useState<Bulletin | null>(null);
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const notificationForm = useForm<z.infer<typeof notificationSchema>>({
      resolver: zodResolver(notificationSchema),
      defaultValues: {
        title: '',
        description: '',
        image: '',
      },
    });

    const bulletinForm = useForm<z.infer<typeof bulletinSchema>>({
      resolver: zodResolver(bulletinSchema),
      defaultValues: {
        title: '',
        content: '',
        coverImage: 'https://picsum.photos/1200/800',
      },
    });

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            bio: user?.bio || '',
            instagramUrl: user?.instagramUrl || '',
            signature: user?.signature || '',
        }
    });

    const newsletterForm = useForm<z.infer<typeof newsletterSchema>>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            subject: '',
            content: '',
        }
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name,
                bio: user.bio || '',
                instagramUrl: user.instagramUrl || '',
                signature: user.signature || '',
            });
            setPreviewUrl(user.avatar);
        }
    }, [user, profileForm]);

    const fetchAllData = async () => {
        const posts = await getPosts();
        setAllPosts(posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
        const notifications = await getNotifications();
        setAllNotifications(notifications);
        const bulletinsResponse = await getBulletins(100); // Fetch all bulletins for admin
        setAllBulletins(bulletinsResponse.bulletins);
    }

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
        fetchAllData();
    }, [user, isAdmin, loading, router]);
    
    if (loading || !isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1 && names[0] && names[1]) {
        return `${names[0][0]}${names[1][0]}`;
        }
        return name.substring(0, 2);
    };

    const handleDeletePostClick = (post: Post) => {
        setPostToDelete(post);
        setPostDeleteDialogOpen(true);
    };
    
    const handleDeleteNotifClick = (notification: Notification) => {
        setNotificationToDelete(notification);
        setNotifDeleteDialogOpen(true);
    };

    const handleDeleteBulletinClick = (bulletin: Bulletin) => {
        setBulletinToDelete(bulletin);
        setBulletinDeleteDialogOpen(true);
    };

    const handleDeletePostConfirm = async () => {
        if (!postToDelete) return;
        try {
            await deletePost(postToDelete.id);
            setAllPosts(allPosts.filter(p => p.id !== postToDelete!.id));
            toast({ title: "Post Deleted", description: `"${postToDelete.title}" has been deleted.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
        }
        setPostDeleteDialogOpen(false);
        setPostToDelete(null);
    };

    const handleDeleteNotifConfirm = async () => {
        if (!notificationToDelete) return;
        try {
            await deleteNotificationAction(notificationToDelete.id);
            setAllNotifications(allNotifications.filter(n => n.id !== notificationToDelete!.id));
            toast({ title: "Notification Deleted", description: `"${notificationToDelete.title}" has been deleted.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete notification.", variant: "destructive" });
        }
        setNotifDeleteDialogOpen(false);
        setNotificationToDelete(null);
    };

    const handleDeleteBulletinConfirm = async () => {
        if (!bulletinToDelete) return;
        try {
            await deleteBulletin(bulletinToDelete.id);
            setAllBulletins(allBulletins.filter(b => b.id !== bulletinToDelete!.id));
            toast({ title: "Bulletin Deleted", description: `"${bulletinToDelete.title}" has been deleted.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete bulletin.", variant: "destructive" });
        }
        setBulletinDeleteDialogOpen(false);
        setBulletinToDelete(null);
    }

    const onNotificationSubmit = async (values: z.infer<typeof notificationSchema>) => {
      try {
        await addNotificationAction(values);
        toast({ title: "Notification Sent!", description: "Your notification has been published to all users." });
        notificationForm.reset();
        await fetchAllData(); // Refresh the list
      } catch (error) {
        toast({ title: "Error", description: "Failed to send notification.", variant: "destructive" });
      }
    }

    const onBulletinSubmit = async (values: z.infer<typeof bulletinSchema>) => {
      try {
        await addBulletin(values);
        toast({ title: "Bulletin Published!", description: "Your new bulletin is now live." });
        bulletinForm.reset();
        await fetchAllData(); // Refresh the list
      } catch (error) {
        toast({ title: "Error", description: "Failed to publish bulletin.", variant: "destructive" });
      }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
        if (!user) return;
        try {
             let newAvatarUrl = user.avatar;
            if (newAvatarFile) {
                newAvatarUrl = await toBase64(newAvatarFile);
            }

            const updates = {
                ...values,
                avatar: newAvatarUrl,
            }

            await updateAuthorProfile(user.id, updates);
            await updateUserProfile(updates);
            
            toast({ title: "Profile Updated!", description: "Your author profile has been saved."});
            setNewAvatarFile(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        }
    }

    const onNewsletterSubmit = async (values: z.infer<typeof newsletterSchema>) => {
        try {
            await sendCustomNewsletter(values.subject, values.content);
            toast({ title: "Newsletter Sent!", description: "Your email has been sent to all subscribers." });
            newsletterForm.reset();
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message || "Failed to send newsletter.", variant: "destructive" });
        }
    }

    return (
        <div className="container mx-auto px-4 py-16 animate-fade-in-up">
            <section className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
                    Admin Dashboard<span className="text-primary">.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Welcome, {user?.name}. Manage your application from here.
                </p>
            </section>
            
            <Tabs defaultValue="analytics" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList>
                        <TabsTrigger value="analytics"><LineChart className="mr-2 h-4 w-4"/>Analytics</TabsTrigger>
                        <TabsTrigger value="management"><BarChart className="mr-2 h-4 w-4"/>Management</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="analytics">
                    <AnalyticsDashboard posts={allPosts} />
                </TabsContent>
                <TabsContent value="management">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-full mx-auto mb-12">
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{allPosts.length}</div>
                                <p className="text-xs text-muted-foreground">Manage all posts below</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1</div>
                                <p className="text-xs text-muted-foreground">Currently logged in</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Bulletins</CardTitle>
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{allBulletins.length}</div>
                                <p className="text-xs text-muted-foreground">Manage all bulletins below</p>
                            </CardContent>
                        </Card>
                        <Link href="/admin/create-post" className="group">
                            <Card className="aurora-border h-full flex flex-col items-center justify-center text-center hover:shadow-2xl transition-shadow duration-300 rounded-xl">
                                <CardHeader>
                                    <PlusCircle className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-lg">Create New Post</CardTitle>
                                    <CardDescription className="text-xs">Write and publish a new article.</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-full mx-auto">
                        <div className="xl:col-span-2">
                            <Card className="glass-card mb-8">
                                <CardHeader>
                                    <CardTitle>Manage Posts</CardTitle>
                                    <CardDescription>Here you can edit or delete existing posts.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50%]">Title</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allPosts.map(post => (
                                                <TableRow key={post.id}>
                                                    <TableCell className="font-medium">{post.title}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={post.featured ? "default" : "secondary"}>
                                                            {post.featured ? "Featured" : "Standard"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{new Date(post.publishedAt).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild variant="ghost" size="icon">
                                                            <Link href={`/admin/edit-post/${post.slug}`}><Edit className="h-4 w-4" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeletePostClick(post)}>
                                                            <Trash className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>Manage Bulletins</CardTitle>
                                    <CardDescription>Here you can delete existing bulletins.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[60%]">Title</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allBulletins.map(bulletin => (
                                                <TableRow key={bulletin.id}>
                                                    <TableCell className="font-medium">{bulletin.title}</TableCell>
                                                    <TableCell>{new Date(bulletin.publishedAt).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBulletinClick(bulletin)}>
                                                            <Trash className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                             <Card className="glass-card">
                                <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <CardTitle>Send Newsletter</CardTitle>
                                </div>
                                    <CardDescription>Send a custom email to all subscribers.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <Form {...newsletterForm}>
                                    <form onSubmit={newsletterForm.handleSubmit(onNewsletterSubmit)} className="space-y-4">
                                        <FormField
                                            control={newsletterForm.control}
                                            name="subject"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                <Input placeholder="A special announcement from Glare" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={newsletterForm.control}
                                            name="content"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Body</FormLabel>
                                                <FormControl>
                                                <Textarea placeholder="<h1>Your Title Here</h1><p>Start writing your email content. You can use HTML for formatting.</p>" {...field} rows={8} />
                                                </FormControl>
                                                 <p className="text-xs text-muted-foreground">You can use HTML tags for formatting.</p>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={newsletterForm.formState.isSubmitting}>
                                            {newsletterForm.formState.isSubmitting ? 'Sending...' : 'Send to All Subscribers'}
                                        </Button>
                                    </form>
                                </Form>
                                </CardContent>
                            </Card>
                            
                            <Card className="glass-card">
                                <CardHeader>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                    <CardTitle>Edit Author Profile</CardTitle>
                                </div>
                                    <CardDescription>Update your public author information.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <Form {...profileForm}>
                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                        <div className="flex flex-col items-center gap-4">
                                            <Avatar className="h-24 w-24">
                                                <AvatarImage src={previewUrl} alt={user?.name} />
                                                <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                                            </Avatar>
                                            <Input 
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                ref={fileInputRef}
                                                className="hidden"
                                            />
                                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Change Photo
                                            </Button>
                                        </div>
                                        <FormField
                                            control={profileForm.control}
                                            name="name"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Author Name</FormLabel>
                                                <FormControl>
                                                <Input placeholder="Yash Raj Verma" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="bio"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Author Bio</FormLabel>
                                                <FormControl>
                                                <Textarea placeholder="A short bio about yourself..." {...field} rows={4} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="instagramUrl"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Instagram URL</FormLabel>
                                                <FormControl>
                                                <Input placeholder="https://instagram.com/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="signature"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Signature Text</FormLabel>
                                                <FormControl>
                                                <Input placeholder="Y. R. Verma" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                    <Button type="submit" className="w-full" disabled={profileForm.formState.isSubmitting}>
                                        {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
                                    </Button>
                                    </form>
                                </Form>
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Megaphone className="h-5 w-5 text-primary" />
                                    <CardTitle>Post a Bulletin</CardTitle>
                                </div>
                                    <CardDescription>Publish a new daily bulletin.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <Form {...bulletinForm}>
                                    <form onSubmit={bulletinForm.handleSubmit(onBulletinSubmit)} className="space-y-4">
                                    <FormField
                                        control={bulletinForm.control}
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
                                        control={bulletinForm.control}
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
                                        control={bulletinForm.control}
                                        name="coverImage"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL</FormLabel>
                                            <FormControl>
                                            <Input placeholder="https://picsum.photos/1200/800" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={bulletinForm.formState.isSubmitting}>
                                        {bulletinForm.formState.isSubmitting ? 'Publishing...' : 'Publish Bulletin'}
                                    </Button>
                                    </form>
                                </Form>
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BellRing className="h-5 w-5 text-primary" />
                                    <CardTitle>Send Notification</CardTitle>
                                </div>
                                    <CardDescription>Publish a new announcement to all users.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <Form {...notificationForm}>
                                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                                    <FormField
                                        control={notificationForm.control}
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
                                        control={notificationForm.control}
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
                                        control={notificationForm.control}
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
                                    <Button type="submit" className="w-full" disabled={notificationForm.formState.isSubmitting}>
                                        {notificationForm.formState.isSubmitting ? 'Sending...' : 'Send Notification'}
                                    </Button>
                                    </form>
                                </Form>
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>Manage Notifications</CardTitle>
                                    <CardDescription>Edit or delete sent notifications.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {allNotifications.length > 0 ? allNotifications.map((notif, index) => (
                                            <div key={notif.id}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1 flex-1">
                                                    <p className="font-medium text-sm">{notif.title}</p>
                                                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                                                    {notif.image && <ImageIcon className="h-4 w-4 inline-block text-muted-foreground" />}
                                                </div>
                                                <div className="flex items-center">
                                                    <Button asChild variant="ghost" size="icon">
                                                        <Link href={`/admin/edit-notification/${notif.id}`}><Edit className="h-4 w-4" /></Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteNotifClick(notif)}>
                                                        <Trash className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {index < allNotifications.length - 1 && <Separator className="mt-4" />}
                                            </div>
                                        )) : (
                                        <p className="text-sm text-muted-foreground text-center">No notifications sent yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>


            <AlertDialog open={isPostDeleteDialogOpen} onOpenChange={setPostDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post
                            <span className="font-bold"> &quot;{postToDelete?.title}&quot;</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePostConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isNotifDeleteDialogOpen} onOpenChange={setNotifDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the notification
                            <span className="font-bold"> &quot;{notificationToDelete?.title}&quot;</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteNotifConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isBulletinDeleteDialogOpen} onOpenChange={setBulletinDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the bulletin
                            <span className="font-bold"> &quot;{bulletinToDelete?.title}&quot;</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBulletinConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminPage;

    

    
