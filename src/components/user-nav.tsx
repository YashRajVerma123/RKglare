
'use client';
import { CreditCard, LogOut, User as UserIcon, Upload, Moon, Sun, Loader2, PanelRightOpen, Settings, UserPlus,LogIn } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState, useRef, useEffect } from 'react';
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

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

// This is the main component for the header.
const UserNav = () => {
  const { user, signIn, signOut, loading, updateUserProfile, isAdmin } = useAuth();
  const [isSignInOpen, setSignInOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newShowEmail, setNewShowEmail] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const [isFollowListOpen, setFollowListOpen] = useState(false);
  const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    setIsMounted(true);
  }, []);


  useEffect(() => {
    if (user) {
        setNewUsername(user.name);
        setPreviewUrl(user.avatar);
        setNewBio(user.bio || '');
        setNewShowEmail(user.showEmail || false);
    }
  }, [user]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
      // On success, the AuthProvider will update the user state,
      // and this component will re-render, closing the dialog.
      setSignInOpen(false);
    } catch (error) {
      // The auth context now handles the "popup closed" error silently.
      // We only need to show a toast for actual errors.
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUsername.trim()) return;

    setIsSaving(true);
    try {
      let newAvatarUrl = user.avatar;
      if (newAvatarFile) {
        // Convert file to Base64 and update
        newAvatarUrl = await toBase64(newAvatarFile);
      }
      
      await updateUserProfile({ 
          name: newUsername.trim(), 
          avatar: newAvatarUrl,
          bio: newBio,
          showEmail: newShowEmail,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      setNewAvatarFile(null);
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
        setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const handleOpenProfile = () => {
    if (user) {
        setNewUsername(user.name);
        setPreviewUrl(user.avatar);
        setNewBio(user.bio || '');
        setNewShowEmail(user.showEmail || false);
        setNewAvatarFile(null);
        setProfileOpen(true);
    }
  }

  const handleOpenFollowList = (type: 'followers' | 'following') => {
      setFollowListType(type);
      setFollowListOpen(true);
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  if (!isMounted) {
      // On the server or during first client render, return a placeholder.
      return <div className="h-9 w-9" />;
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
                  <AvatarFallback>
                    <Settings className="h-5 w-5" />
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 font-content" align="end" forceMount>
          {user ? (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <div className="flex gap-4 pt-1">
                    <div className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => handleOpenFollowList('followers')}>
                        <span className="font-bold text-foreground">{user.followers || 0}</span> Followers
                    </div>
                     <div className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => handleOpenFollowList('following')}>
                        <span className="font-bold text-foreground">{user.following || 0}</span> Following
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={handleOpenProfile}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {isAdmin && (
                   <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
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
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </>
          ) : (
             <>
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="flex-1 ml-2">Theme</span>
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                </div>
                <DropdownMenuItem onSelect={() => setSignInOpen(true)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
          </DialogContent>
        </Dialog>


       <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate}>
            <div className="grid gap-4 py-4">
               <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={previewUrl} alt={newUsername} />
                    <AvatarFallback>{getInitials(newUsername)}</AvatarFallback>
                  </Avatar>
                  <Input 
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Tell us a little bit about yourself..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-email" 
                  checked={newShowEmail}
                  onCheckedChange={setNewShowEmail}
                />
                <Label htmlFor="show-email">Show email on your profile card</Label>
              </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setProfileOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
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

    