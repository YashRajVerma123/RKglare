

'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Author } from "@/lib/data";
import { getFollowList, removeFollower, toggleFollow } from "@/app/actions/follow-actions";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Loader2, UserMinus, UserPlus, X } from "lucide-react";
import ProfileCard from "./profile-card";
import { useToast } from "@/hooks/use-toast";

interface FollowListDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  listType: 'followers' | 'following';
  userId: string;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const FollowListDialog = ({ isOpen, onOpenChange, listType, userId }: FollowListDialogProps) => {
  const [list, setList] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [profileCardUser, setProfileCardUser] = useState<Author | null>(null);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const { user: loggedInUser, updateFollowingCount, updateFollowerCount } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      const fetchList = async () => {
        setIsLoading(true);
        const followList = await getFollowList(userId, listType);
        setList(followList);
        setIsLoading(false);
      };
      fetchList();
    }
  }, [isOpen, userId, listType]);

  const handleUnfollow = async (targetUserId: string) => {
    if (!loggedInUser) return;
    setIsSubmitting(targetUserId);
    const result = await toggleFollow(loggedInUser.id, targetUserId, true);
    if (result.success) {
      setList(prev => prev.filter(u => u.id !== targetUserId));
      updateFollowingCount(-1);
    } else {
      toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
    setIsSubmitting(null);
  };

  const handleRemoveFollower = async (followerId: string) => {
    if (!loggedInUser) return;
    setIsSubmitting(followerId);
    const result = await removeFollower(loggedInUser.id, followerId);
    if (result.success) {
      setList(prev => prev.filter(u => u.id !== followerId));
      updateFollowerCount(-1);
    } else {
      toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
    setIsSubmitting(null);
  };

  const handleUserClick = (user: Author) => {
    setProfileCardUser(user);
    setIsProfileCardOpen(true);
  };

  const isMyList = loggedInUser?.id === userId;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{listType}</DialogTitle>
            <DialogDescription>
              {listType === 'followers' ? 'Users who follow you' : 'Users you follow'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-80 overflow-y-auto space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="animate-spin" />
              </div>
            ) : list.length === 0 ? (
              <p className="text-muted-foreground text-center">No users found.</p>
            ) : (
              list.map(user => (
                <div key={user.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleUserClick(user)}>
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium hover:underline">{user.name}</span>
                  </div>
                  {isMyList && (
                    <>
                      {listType === 'following' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting === user.id}
                          onClick={() => handleUnfollow(user.id)}
                        >
                          {isSubmitting === user.id ? <Loader2 className="animate-spin h-4 w-4" /> : <UserMinus className="mr-2 h-4 w-4" />}
                          {isSubmitting !== user.id && 'Unfollow'}
                        </Button>
                      )}
                      {listType === 'followers' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isSubmitting === user.id}
                          onClick={() => handleRemoveFollower(user.id)}
                        >
                           {isSubmitting === user.id ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
                           {isSubmitting !== user.id && 'Remove'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isProfileCardOpen} onOpenChange={setIsProfileCardOpen}>
          <DialogContent className="sm:max-w-md p-0">
               {profileCardUser && <ProfileCard user={profileCardUser} />}
          </DialogContent>
      </Dialog>
    </>
  );
};

export default FollowListDialog;
