
'use client';
import { CreditCard, LogOut, User as UserIcon, Upload, Moon, Sun, Loader2, PanelRightOpen, Settings, UserPlus,LogIn, RefreshCw, Type, X, AtSign, Image as ImageIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Switch } from './ui/switch';
import { usePathname } from 'next/navigation';
import { Textarea } from './ui/textarea';
import FollowListDialog from './follow-list-dialog';
import Link from 'next/link';
import ProfileCard from './profile-card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { updateAuthorProfile } from '@/app/actions/user-actions';
import { ScrollArea } from './ui/scroll-area';
import { getLevel, getProgressToNextLevel } from '@/lib/gamification';
import { Progress } from './ui/progress';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { getAuthors } from '@/lib/data';
import { Trophy } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import Image from 'next/image';

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const profileFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    username: z.string().min(3, "Username must be at least 3 characters.").max(15, "Username cannot exceed 15 characters.").regex(/^[a-z0-9_.]+$/, "Can only contain lowercase letters, numbers, underscores, and periods."),
    bio: z.string().optional(),
    showEmail: z.boolean().default(false),
    instagramUrl: z.string().url('Please enter a valid Instagram URL.').optional().or(z.literal('')),
    signature: z.string().optional(),
    preferences: z.object({
        font: z.enum(['default', 'serif', 'mono']).optional(),
    }).optional(),
});

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
};


// This is the main component for the header.
const UserNav = () => {
  const { user, signIn, signOut, loading, updateUserProfile, isAdmin, refreshUser } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSignInOpen, setSignInOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const [isFollowListOpen, setFollowListOpen] = useState(false);
  const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  const profileFormDefaultValues = useMemo(() => ({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    showEmail: user?.showEmail || false,
    instagramUrl: user?.instagramUrl || '',
    signature: user?.signature || '',
    preferences: {
        font: user?.preferences?.font || 'default',
    },
  }), [user]);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormDefaultValues,
  });
  
  const gamificationInfo = useMemo(() => {
    if (!user) return null;
    const points = user.points || 0;
    const level = getLevel(points);
    const { progress, currentPoints, requiredPoints } = getProgressToNextLevel(points);
    return { level, progress, currentPoints, requiredPoints };
  }, [user]);

  const watchedProfile = profileForm.watch();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
        const fetchRank = async () => {
            const allUsers = await getAuthors();
            const sortedUsers = allUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
            const userRank = sortedUsers.findIndex(u => u.id === user.id);
            setRank(userRank !== -1 ? userRank + 1 : null);
        };
        fetchRank();
    }
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    
    // Also re-fetch rank
    if (user) {
        const allUsers = await getAuthors();
        const sortedUsers = allUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
        const userRank = sortedUsers.findIndex(u => u.id === user.id);
        setRank(userRank !== -1 ? userRank + 1 : null);
    }

    setIsRefreshing(false);
  }


  useEffect(() => {
    if (user && isProfileOpen) {
        profileForm.reset(profileFormDefaultValues);
        setAvatarPreview(user.avatar);
        setBannerPreview(user.bannerImage || '');
    }
  }, [user, profileForm, isProfileOpen, profileFormDefaultValues]);
  
  useEffect(() => {
    if (isProfileOpen === false) {
        setMenuOpen(false);
    }
  }, [isProfileOpen]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
      setSignInOpen(false);
    } catch (error) {
      if ((error as Error).message.includes('auth/popup-closed-by-user')) {
        // Do nothing
      } else {
        toast({
            title: 'Sign In Failed',
            description: 'Could not sign you in. Please try again.',
            variant: 'destructive',
        });
      }
    } finally {
        setIsSigningIn(false);
    }
  };

  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      let newAvatarUrl = user.avatar;
      let newBannerUrl = user.bannerImage;

      if (newAvatarFile) {
        newAvatarUrl = await toBase64(newAvatarFile);
      }
      if (newBannerFile) {
        newBannerUrl = await toBase64(newBannerFile);
      }
      
      const updateData = {
          ...values,
          avatar: newAvatarUrl,
          bannerImage: newBannerUrl,
      };

      await updateAuthorProfile(user.id, updateData);
      await updateUserProfile(updateData);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      setNewAvatarFile(null);
      setNewBannerFile(null);
      setProfileOpen(false);
    } catch (error) {
      console.error('Profile update failed', error);
       toast({
        title: 'Update Failed',
        description: (error as Error).message || 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setNewAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }
  }
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setNewBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    }
  }


  const handleOpenProfile = () => {
    if (user) {
        profileForm.reset({
            ...profileFormDefaultValues,
            username: user.username || '',
        });
        setAvatarPreview(user.avatar);
        setBannerPreview(user.bannerImage || '');
        setNewAvatarFile(null);
        setNewBannerFile(null);
        setProfileOpen(true);
    }
  }

  const handleOpenFollowList = (type: 'followers' | 'following') => {
      setFollowListType(type);
      setFollowListOpen(true);
  }
  
  if (!isMounted) {
      // On the server or during first client render, return a placeholder.
      return <div className="h-9 w-9" />;
  }
  
  const MenuItem = ({ children, onSelect }: { children: React.ReactNode, onSelect?: () => void }) => (
    <div
      onClick={onSelect}
      className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      {children}
    </div>
  );
  
  return (
    <>
      <Popover open={isMenuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                {loading ? (
                  <AvatarFallback className="animate-pulse bg-muted"></AvatarFallback>
                ) : user ? (
                  <>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </>
                ) : (
                  <Avatar>
                    <AvatarFallback className="bg-transparent">
                      <Settings className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </Avatar>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 font-content p-1" align="end">
          {user ? (
            <>
              <div className="p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
                  <div className="flex gap-4 pt-1">
                    <div className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => handleOpenFollowList('followers')}>
                        <span className="font-bold text-foreground">{user.followers || 0}</span> Followers
                    </div>
                     <div className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => handleOpenFollowList('following')}>
                        <span className="font-bold text-foreground">{user.following || 0}</span> Following
                    </div>
                  </div>
                </div>
              </div>

               {gamificationInfo && (
                  <>
                    <div className="my-1 h-px bg-muted" />
                     <div className="p-2">
                        <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                                <div className="space-y-1 cursor-pointer">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <gamificationInfo.level.icon className="h-4 w-4" style={{color: gamificationInfo.level.color}}/>
                                            <span className="text-xs font-medium" style={{color: gamificationInfo.level.color}}>{gamificationInfo.level.name}</span>
                                        </div>
                                         {rank && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Trophy className="h-3 w-3" />
                                                <span>#{rank}</span>
                                            </div>
                                         )}
                                    </div>
                                    <Progress value={gamificationInfo.progress} className="h-1.5" />
                                     <div className="flex justify-between items-center text-xs text-muted-foreground">
                                       <div className="flex items-center gap-1">
                                          <span>{gamificationInfo.currentPoints.toLocaleString()} PTS</span>
                                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleRefresh} disabled={isRefreshing}>
                                              <RefreshCw className={isRefreshing ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
                                          </Button>
                                       </div>
                                       <span>Next: {gamificationInfo.requiredPoints.toLocaleString()}</span>
                                    </div>
                                </div>
                             </TooltipTrigger>
                             <TooltipContent>
                                <p>{gamificationInfo.currentPoints.toLocaleString()} / {gamificationInfo.requiredPoints.toLocaleString()} points to next level</p>
                             </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                     </div>
                  </>
               )}

              <div className="my-1 h-px bg-muted" />
              <MenuItem onSelect={handleOpenProfile}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
              </MenuItem>
              {isAdmin && (
                 <Link href="/admin" className="block">
                    <MenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                    </MenuItem>
                  </Link>
              )}
                 <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="flex-1 ml-2">Theme</span>
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                </div>
              <div className="my-1 h-px bg-muted" />
              <MenuItem onSelect={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </MenuItem>
            </>
          ) : (
             <>
                <div className="p-2 text-sm font-semibold">Settings</div>
                <div className="my-1 h-px bg-muted" />
                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="flex-1 ml-2">Theme</span>
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                </div>
                <MenuItem onSelect={() => setSignInOpen(true)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </MenuItem>
            </>
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={isSignInOpen} onOpenChange={setSignInOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>
                To continue to Glare, sign in with your Google account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSignIn} className="w-full" disabled={isSigningIn}>
                {isSigningIn ? (
                     <div className="loader-dots">
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                    </div>
                ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 72.2C297.1 114.5 273.5 104 248 104c-73.8 0-134.3 60.5-134.3 134.3s60.5 134.3 134.3 134.3c84.1 0 115.3-63.8 119.9-95.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                )}
                {isSigningIn ? 'Signing In...' : 'Sign in with Google'}
              </Button>
            </div>
            <DialogClose asChild>
                <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </DialogClose>
          </DialogContent>
        </Dialog>


       <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-4xl">
           <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                        <div className="space-y-4">
                          <Label>Profile Picture</Label>
                           <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                  <AvatarImage src={avatarPreview} alt={watchedProfile.name} />
                                  <AvatarFallback>{getInitials(watchedProfile.name || '')}</AvatarFallback>
                              </Avatar>
                              <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} ref={avatarInputRef} className="hidden"/>
                              <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                              </Button>
                          </div>
                        </div>

                         <div className="space-y-4">
                          <Label>Banner Image</Label>
                           <div className="flex items-center gap-4">
                              <div className="w-24 h-12 rounded-md bg-muted overflow-hidden relative">
                                {bannerPreview && <Image src={bannerPreview} alt="Banner preview" fill className="object-cover"/>}
                              </div>
                              <Input id="banner-upload" type="file" accept="image/*" onChange={handleBannerChange} ref={bannerInputRef} className="hidden"/>
                              <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()}>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                              </Button>
                          </div>
                        </div>

                        <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-8" {...field} />
                                </div>
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
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about yourself..."
                                    rows={3}
                                    {...field}
                                    />
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
                                <Input placeholder="https://instagram.com/your-profile" {...field} />
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
                                <FormLabel>Signature</FormLabel>
                                <FormControl>
                                <Input placeholder="Your Signature" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={profileForm.control}
                            name="showEmail"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                                <FormLabel>Show email on your profile card</FormLabel>
                            </FormItem>
                            )}
                        />
                        {user?.premium?.active && (
                            <FormField
                                control={profileForm.control}
                                name="preferences.font"
                                render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className='flex items-center gap-2'><Type className='h-4 w-4' /> Reading Font</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="default" />
                                            </FormControl>
                                            <FormLabel className="font-normal font-content">Default</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="serif" />
                                            </FormControl>
                                            <FormLabel className="font-normal font-reader">Serif</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="mono" />
                                            </FormControl>
                                            <FormLabel className="font-normal font-mono">Monospace</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}


                        <DialogFooter className="pt-4">
                            <Button variant="ghost" onClick={() => setProfileOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save changes'}
                            </Button>
                        </DialogFooter>
                        </form>
                    </Form>
                    <div className="space-y-4">
                        <Label>Live Preview</Label>
                        {user && (
                            <ProfileCard user={{
                            ...user,
                            ...watchedProfile,
                            avatar: avatarPreview,
                            bannerImage: bannerPreview,
                            }} />
                        )}
                    </div>
                </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      {user && (
         <FollowListDialog 
            isOpen={isFollowListOpen} 
            onOpenChange={setFollowListOpen}
            listType={followListType}
            userId={user.id}
         />
      )}
    </>
  );
};

export default UserNav;
