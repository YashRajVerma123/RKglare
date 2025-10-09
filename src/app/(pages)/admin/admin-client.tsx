
'use client';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Edit, PlusCircle, Trash, Users, BellRing, Image as ImageIcon, Megaphone, User as UserIcon, Upload, LineChart, Mail, Loader2, Bot, Star, BookOpen } from "lucide-react";
import { Post, Notification, Bulletin, Author, DiaryEntry } from "@/lib/data";
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
import { addBulletinAction, deleteBulletinAction } from "@/app/actions/bulletin-actions";
import { Separator } from "@/components/ui/separator";
import { updateAuthorProfile } from "@/app/actions/user-actions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import AboutTheAuthor from "@/components/about-the-author";
import { generateNewsletterMailto } from "@/app/actions/newsletter-actions";
import { Label } from "@/components/ui/label";
import BulletinCard from "@/components/bulletin-card";
import { generateBulletinContent } from "@/ai/flows/bulletin-flow";
import { updateUserPoints } from "@/app/actions/gamification-actions";
import { manageUserSubscription } from "@/app/actions/premium-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteDiaryEntryAction } from "@/app/actions/diary-actions";
import { compressImage } from "@/lib/utils";

const notificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  image: z.string().url().optional().or(z.literal('')),
});

const bulletinSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  coverImage: z.string().url('Please enter a valid image URL.'),
  topic: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().min(20, 'Bio must be at least 20 characters.'),
  instagramUrl: z.string().url('Please enter a valid Instagram URL.').optional().or(z.literal('')),
  signature: z.string().min(2, 'Signature must be at least 2 characters.').optional(),
});

const newsletterSchema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters.'),
    content: z.string().min(100, 'Content must be at least 100 characters.'),
});

const pointsSchema = z.object({
    points: z.coerce.number().int("Points must be a whole number.").optional(),
    subscriptionDays: z.coerce.number().int("Days must be a whole number.").optional(),
    reason: z.string().min(5, "Please provide a reason."),
});

interface AdminClientPageProps {
    initialPosts: Post[];
    initialNotifications: Notification[];
    initialBulletins: Bulletin[];
    initialUsers: Author[];
    initialDiaryEntries: DiaryEntry[];
}

const AdminClientPage = ({ initialPosts, initialNotifications, initialBulletins, initialUsers, initialDiaryEntries }: AdminClientPageProps) => {
    const { user, isAdmin, loading: authLoading, updateUserProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allPosts, setAllPosts] = useState<Post[]>(initialPosts);
    const [allNotifications, setAllNotifications] = useState<Notification[]>(initialNotifications);
    const [allBulletins, setAllBulletins] = useState<Bulletin[]>(initialBulletins);
    const [allUsers, setAllUsers] = useState<Author[]>(initialUsers);
    const [allDiaryEntries, setAllDiaryEntries] = useState<DiaryEntry[]>(initialDiaryEntries);
    
    const [isPostDeleteDialogOpen, setPostDeleteDialogOpen] = useState(false);
    const [isNotifDeleteDialogOpen, setNotifDeleteDialogOpen] = useState(false);
    const [isBulletinDeleteDialogOpen, setBulletinDeleteDialogOpen] = useState(false);
    const [isDiaryDeleteDialogOpen, setDiaryDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
    const [bulletinToDelete, setBulletinToDelete] = useState<Bulletin | null>(null);
    const [diaryToDelete, setDiaryToDelete] = useState<DiaryEntry | null>(null);
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [isPointsDialogOpen, setPointsDialogOpen] = useState(false);
    const [userToEditPoints, setUserToEditPoints] = useState<Author | null>(null);

    const pointsForm = useForm<z.infer<typeof pointsSchema>>({
        resolver: zodResolver(pointsSchema),
        defaultValues: { reason: "" },
    });

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
        topic: '',
      },
    });

    const newsletterForm = useForm<z.infer<typeof newsletterSchema>>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    });

    const profileFormDefaultValues = useMemo(() => ({
        name: user?.name || '',
        bio: user?.bio || '',
        instagramUrl: user?.instagramUrl || '',
        signature: user?.signature || '',
    }), [user]);

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: profileFormDefaultValues
    });
    
    const watchedProfile = profileForm.watch();
    const watchedBulletin = bulletinForm.watch();
    const watchedNotification = notificationForm.watch();

    useEffect(() => {
        if (user) {
            profileForm.reset(profileFormDefaultValues);
            setPreviewUrl(user.avatar);
        }
    }, [user, profileForm, profileFormDefaultValues]);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [user, isAdmin, authLoading, router]);
    
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
     if (!isAdmin) {
        return null;
    }

    const getInitials = (name: string) => {
        if (!name) return '';
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

    const handleDeleteDiaryClick = (entry: DiaryEntry) => {
        setDiaryToDelete(entry);
        setDiaryDeleteDialogOpen(true);
    };

    const handleDeletePostConfirm = async () => {
        if (!postToDelete) return;
        
        const originalPosts = allPosts;
        
        setAllPosts(prev => prev.filter(p => p.id !== postToDelete.id));
        setPostDeleteDialogOpen(false);

        try {
            const result = await deletePost(postToDelete.id);
            if (result.error) {
                throw new Error(result.error);
            }
            toast({ title: "Post Deleted", description: `"${postToDelete.title}" has been deleted.` });
        } catch (error) {
            setAllPosts(originalPosts);
            toast({ title: "Error", description: "Failed to delete post. Your post has been restored.", variant: "destructive" });
        } finally {
            setPostToDelete(null);
        }
    };

    const handleDeleteNotifConfirm = async () => {
        if (!notificationToDelete) return;
        
        const originalNotifications = allNotifications;

        setAllNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
        setNotifDeleteDialogOpen(false);
        
        try {
            const result = await deleteNotificationAction(notificationToDelete.id);
            if (result.error) {
                throw new Error(result.error);
            }
            toast({ title: "Notification Deleted", description: `"${notificationToDelete.title}" has been deleted.` });
        } catch (error) {
            setAllNotifications(originalNotifications);
            toast({ title: "Error", description: "Failed to delete notification. It has been restored.", variant: "destructive" });
        } finally {
            setNotificationToDelete(null);
        }
    };
    
     const handleDeleteBulletinConfirm = async () => {
        if (!bulletinToDelete) return;
        
        const originalBulletins = allBulletins;

        setAllBulletins(prev => prev.filter(b => b.id !== bulletinToDelete.id));
        setBulletinDeleteDialogOpen(false);
        
        try {
            const result = await deleteBulletinAction(bulletinToDelete.id);
            if (result.error) {
                throw new Error(result.error);
            }
            toast({ title: "Bulletin Deleted", description: `"${bulletinToDelete.title}" has been deleted.` });
        } catch (error) {
            setAllBulletins(originalBulletins);
            toast({ title: "Error", description: "Failed to delete bulletin. It has been restored.", variant: "destructive" });
        } finally {
            setBulletinToDelete(null);
        }
    };

    const handleDeleteDiaryConfirm = async () => {
        if (!diaryToDelete) return;
        
        const originalEntries = allDiaryEntries;

        setAllDiaryEntries(prev => prev.filter(b => b.id !== diaryToDelete.id));
        setDiaryDeleteDialogOpen(false);
        
        try {
            const result = await deleteDiaryEntryAction(diaryToDelete.id);
            if (result.error) {
                throw new Error(result.error);
            }
            toast({ title: "Diary Entry Deleted", description: `"${diaryToDelete.title}" has been deleted.` });
        } catch (error) {
            setAllDiaryEntries(originalEntries);
            toast({ title: "Error", description: "Failed to delete diary entry. It has been restored.", variant: "destructive" });
        } finally {
            setDiaryToDelete(null);
        }
    };

    const onNotificationSubmit = async (values: z.infer<typeof notificationSchema>) => {
      try {
        const newNotif = await addNotificationAction(values);
        setAllNotifications(prev => [newNotif, ...prev]);
        toast({ title: "Notification Sent!", description: "Your notification has been published to all users." });
        notificationForm.reset();
      } catch (error) {
        toast({ title: "Error", description: "Failed to send notification.", variant: "destructive" });
      }
    }

    const onBulletinSubmit = async (values: z.infer<typeof bulletinSchema>) => {
      try {
        const newBulletin = await addBulletinAction(values);
        setAllBulletins(prev => [newBulletin, ...prev]);
        toast({ title: "Bulletin Published!", description: "Your new bulletin is now live." });
        bulletinForm.reset();
      } catch (error) {
        toast({ title: "Error", description: "Failed to publish bulletin.", variant: "destructive" });
      }
    }
    
    const handleGenerateBulletin = async () => {
        const topic = bulletinForm.getValues("topic");
        if (!topic) {
            bulletinForm.setError("topic", { message: "Please enter a topic to generate content."});
            return;
        }
        
        setIsGenerating(true);
        try {
            const result = await generateBulletinContent({ topic });
            bulletinForm.setValue("title", result.title);
            bulletinForm.setValue("content", result.content);
            bulletinForm.setValue("coverImage", result.coverImage);
        } catch (e) {
            toast({ title: "Error", description: "Failed to generate bulletin content.", variant: "destructive"});
        } finally {
            setIsGenerating(false);
        }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressedBase64 = await compressImage(file, 0.75, 256);
                setNewAvatarFile(file);
                setPreviewUrl(compressedBase64);
            } catch (error) {
                toast({ title: "Error Compressing Image", description: "Could not process the image. Please try another.", variant: "destructive" });
            }
        }
    }

    const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
        if (!user) return;
        try {
             let newAvatarUrl = user.avatar;
            if (newAvatarFile && previewUrl.startsWith('data:')) {
                newAvatarUrl = previewUrl;
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
            const result = await generateNewsletterMailto(values);
             if (result.error) {
                throw new Error(result.error);
            }
            if (typeof result.mailtoLink === 'string') {
                window.location.href = result.mailtoLink;
                toast({ title: "Newsletter Prepared!", description: `Your email client should open with a draft for ${result.subscriberCount} subscribers.` });
            } else {
                 throw new Error("Could not generate the newsletter link.");
            }
        } catch (error) {
             toast({ title: "Error Preparing Newsletter", description: (error as Error).message, variant: "destructive" });
        }
    }

    const handleEditPointsClick = (userToEdit: Author) => {
        setUserToEditPoints(userToEdit);
        pointsForm.reset();
        setPointsDialogOpen(true);
    };

    const onPointsSubmit = async (values: z.infer<typeof pointsSchema>) => {
        if (!user || !userToEditPoints) return;
        
        let success = true;
        let finalMessage = "";

        if (values.points !== undefined) {
             const result = await updateUserPoints(user.id, userToEditPoints.id, values.points, values.reason);
             if (result.success) {
                 finalMessage += `Points updated to ${result.newTotal?.toLocaleString() || 'N/A'}. `;
                 setAllUsers(prevUsers => prevUsers.map(u => u.id === userToEditPoints.id ? { ...u, points: result.newTotal } : u));
             } else {
                 success = false;
                 toast({ title: "Error Updating Points", description: result.error, variant: "destructive" });
             }
        }
        
        if (values.subscriptionDays !== undefined) {
             const result = await manageUserSubscription(user.id, userToEditPoints.id, values.subscriptionDays);
             if (result.success) {
                 finalMessage += `Subscription updated.`;
                 // Update local state for subscription
                 const newExpiry = new Date();
                 newExpiry.setDate(newExpiry.getDate() + values.subscriptionDays);
                 setAllUsers(prevUsers => prevUsers.map(u => {
                     if (u.id === userToEditPoints.id) {
                         return { ...u, premium: { active: values.subscriptionDays! > 0, expires: newExpiry.toISOString() } };
                     }
                     return u;
                 }));
             } else {
                 success = false;
                 toast({ title: "Error Updating Subscription", description: result.error, variant: "destructive" });
             }
        }

        if (success) {
             toast({
                title: "User Updated!",
                description: `${userToEditPoints.name}'s profile has been updated. ${finalMessage}`
            });
            setPointsDialogOpen(false);
        }
    };

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
                        <TabsTrigger value="diary"><BookOpen className="mr-2 h-4 w-4"/>Diary</TabsTrigger>
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
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{allUsers.length}</div>
                                <p className="text-xs text-muted-foreground">Manage all users below</p>
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
                        <div className="xl:col-span-2 space-y-8">
                            <Card className="glass-card">
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
                                    <CardTitle>User Management</CardTitle>
                                    <CardDescription>View all registered users and manage their points or subscription status.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Points</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allUsers.map(u => {
                                                const isPremium = u.premium?.active && u.premium.expires && new Date(u.premium.expires) > new Date();
                                                return (
                                                    <TableRow key={u.id}>
                                                        <TableCell className="font-medium flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={u.avatar} alt={u.name} />
                                                                <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                                                            </Avatar>
                                                            {u.name}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                                        <TableCell>{(u.points || 0).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            {isPremium ? (
                                                                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">
                                                                    <Star className="h-3 w-3 mr-1" />
                                                                    Glare+
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Standard</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="outline" size="sm" onClick={() => handleEditPointsClick(u)}>
                                                                <Edit className="h-3 w-3 mr-1" /> Manage
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-primary" />
                                        <CardTitle>Send Newsletter</CardTitle>
                                    </div>
                                    <CardDescription>Compose and send a newsletter to all subscribers.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...newsletterForm}>
                                        <form onSubmit={newsletterForm.handleSubmit(onNewsletterSubmit)} className="space-y-4">
                                            <FormField
                                                control={newsletterForm.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Subject</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your amazing newsletter title" {...field} />
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
                                                        <FormLabel>Body</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Write your newsletter content here. You can use HTML for formatting." {...field} rows={8} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full" disabled={newsletterForm.formState.isSubmitting}>
                                                {newsletterForm.formState.isSubmitting ? 'Preparing...' : 'Prepare Newsletter in Email Client'}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            
                            <Card className="glass-card">
                                <CardHeader>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                    <CardTitle>Edit Author Profile</CardTitle>
                                </div>
                                    <CardDescription>Update your public author information.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-6">
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
                                        <div className="space-y-2">
                                            <Label>Live Preview</Label>
                                            <AboutTheAuthor previewData={{
                                                ...watchedProfile,
                                                avatar: previewUrl,
                                                name: watchedProfile.name || '',
                                                bio: watchedProfile.bio || '',
                                                signature: watchedProfile.signature || '',
                                                instagramUrl: watchedProfile.instagramUrl || '',
                                            }} />
                                        </div>
                                    </div>
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
                                    <div className="grid grid-cols-1 gap-6">
                                        <Form {...bulletinForm}>
                                            <form onSubmit={bulletinForm.handleSubmit(onBulletinSubmit)} className="space-y-4">
                                            <FormField
                                                control={bulletinForm.control}
                                                name="topic"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Topic</FormLabel>
                                                    <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input placeholder="e.g., 'AI in Healthcare'" {...field} />
                                                        <Button type="button" variant="outline" onClick={handleGenerateBulletin} disabled={isGenerating}>
                                                            <Bot className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
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
                                        <div className="space-y-2">
                                            <Label>Live Preview</Label>
                                            <BulletinCard bulletin={{
                                                id: 'preview',
                                                publishedAt: new Date().toISOString(),
                                                ...watchedBulletin,
                                                coverImage: watchedBulletin.coverImage || 'https://picsum.photos/1200/800',
                                            }} index={0} />
                                        </div>
                                    </div>
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
                                    <div className="grid grid-cols-1 gap-6">
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
                                        <div className="space-y-2">
                                            <Label>Live Preview</Label>
                                            <div className="p-4 rounded-lg border bg-card text-card-foreground">
                                                <div className="grid grid-cols-[25px_1fr] items-start">
                                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium leading-none">{watchedNotification.title || "Notification Title"}</p>
                                                        <p className="text-sm text-muted-foreground">{watchedNotification.description || "Notification description will appear here."}</p>
                                                        {watchedNotification.image && (
                                                            <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                                                                <img src={watchedNotification.image} alt="Preview" className="object-cover w-full h-full" />
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-muted-foreground/70 pt-1">{new Date().toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>Manage Content</CardTitle>
                                    <CardDescription>Edit or delete existing content.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="bulletins" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
                                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="bulletins">
                                            <div className="space-y-4 pt-4">
                                                {allBulletins.length > 0 ? allBulletins.map((item, index) => (
                                                    <div key={item.id}>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="space-y-1 flex-1">
                                                            <p className="font-medium text-sm">{item.title}</p>
                                                            <p className="text-xs text-muted-foreground">{item.content}</p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Button asChild variant="ghost" size="icon">
                                                                <Link href={`/admin/edit-bulletin/${item.id}`}><Edit className="h-4 w-4" /></Link>
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBulletinClick(item)}>
                                                                <Trash className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {index < allBulletins.length - 1 && <Separator className="mt-4" />}
                                                    </div>
                                                )) : (
                                                <p className="text-sm text-muted-foreground text-center">No bulletins sent yet.</p>
                                                )}
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="notifications">
                                            <div className="space-y-4 pt-4">
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
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="diary">
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Manage Diary</CardTitle>
                                <CardDescription>Create, edit, or delete your personal diary entries.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/create-diary-entry">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Entry
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Chapter</TableHead>
                                        <TableHead className="w-[50%]">Title</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allDiaryEntries.map(entry => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium">#{entry.chapter}</TableCell>
                                            <TableCell>{entry.title}</TableCell>
                                            <TableCell>{entry.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="icon">
                                                    <Link href={`/admin/edit-diary-entry/${entry.id}`}><Edit className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDiaryClick(entry)}>
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
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
             <AlertDialog open={isDiaryDeleteDialogOpen} onOpenChange={setDiaryDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the diary entry
                            <span className="font-bold"> &quot;{diaryToDelete?.title}&quot;</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDiaryConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
             <Dialog open={isPointsDialogOpen} onOpenChange={setPointsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage {userToEditPoints?.name}</DialogTitle>
                        <DialogDescription>
                            Manually adjust points or subscription status for this user.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...pointsForm}>
                        <form onSubmit={pointsForm.handleSubmit(onPointsSubmit)} className="space-y-4">
                            <FormField
                                control={pointsForm.control}
                                name="points"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points to Add/Subtract</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 50 or -20" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={pointsForm.control}
                                name="subscriptionDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Glare+ Subscription Days</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 30 (add) or 0 (remove)" {...field} />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground mt-1">Enter a positive number to add days, or 0 to revoke the subscription.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={pointsForm.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Manual correction, reward" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setPointsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={pointsForm.formState.isSubmitting}>
                                    {pointsForm.formState.isSubmitting ? "Updating..." : "Update User"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClientPage;

    

    
