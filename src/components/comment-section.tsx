
'use client';

import { useState, useEffect, useMemo, useRef, KeyboardEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addComment, updateComment, deleteComment, toggleCommentHighlight, toggleCommentPin } from '@/app/actions/comment-actions';
import { toggleCommentLike } from '@/app/actions/user-data-actions';
import { Comment as CommentType, Author } from '@/lib/data';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, MessageSquare, MoreHorizontal, Trash2, Edit, Pin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ProfileCard from './profile-card';

interface CommentSectionProps {
  postId: string;
  initialComments: CommentType[];
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const sortComments = (commentList: CommentType[]) => {
    return [...commentList].sort((a,b) => (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Sub-component for submitting a comment or reply
const CommentForm = ({ 
    postId, 
    onCommentAdded, 
    parentId = null,
    buttonText = "Post Comment",
    initialContent = '',
    onCancel,
    isEditing = false,
    commentId,
}: { 
    postId: string, 
    onCommentAdded: (newComment: CommentType) => void,
    parentId?: string | null,
    buttonText?: string,
    initialContent?: string,
    onCancel?: () => void,
    isEditing?: boolean,
    commentId?: string,
}) => {
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isAdmin, signIn } = useAuth();
    const { toast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if (isEditing) {
            textareaRef.current?.focus();
            textareaRef.current?.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    const handleSubmit = async () => {
        if (!content.trim()) return;

        if (!user) {
            toast({
                title: 'Please sign in',
                description: 'You need to be signed in to post a comment.',
                action: <Button onClick={signIn}>Sign In</Button>
            });
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && commentId) {
                const result = await updateComment(postId, commentId, content, user.id, isAdmin);
                if (result.error) throw new Error(result.error);
                if (result.success && result.updatedComment) {
                    onCommentAdded(result.updatedComment);
                }
            } else {
                const result = await addComment(postId, content, user, parentId);
                if (result.error) throw new Error(result.error);
                if (result.comment) {
                    onCommentAdded(result.comment);
                    setContent('');
                }
            }
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'An error occurred.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
            if (onCancel) onCancel();
        }
    };
    
     if (!user && !isEditing) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
                {!isEditing && user && (
                    <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                )}
                <Textarea
                    ref={textareaRef}
                    placeholder={parentId ? "Write a reply..." : "Add your comment..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className={cn(isEditing && 'ml-14')}
                />
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : buttonText}
                </Button>
            </div>
        </div>
    )
}

const LikeButton = ({ 
    comment,
    postId,
}: {
    comment: CommentType,
    postId: string,
}) => {
    const { user, likedComments, setLikedComments, signIn } = useAuth();
    const { toast } = useToast();
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [isAnimating, setIsAnimating] = useState(false);

    const isLiked = user ? likedComments[comment.id] === true : false;

    const handleLikeClick = async () => {
        if (!user) {
            toast({ title: 'Please sign in', description: 'You need to be logged in to like comments.', action: <Button onClick={signIn}>Sign In</Button> });
            return;
        }

        if (!isLiked) {
            setIsAnimating(true);
        }
        
        const newLikedState = !isLiked;
        setLikedComments(prev => ({...prev, [comment.id]: newLikedState}));
        setLikeCount(prev => prev + (newLikedState ? 1 : -1));

        const result = await toggleCommentLike(user.id, postId, comment.id, isLiked);
        if (result.error) {
            // Revert on error
            setLikedComments(prev => ({...prev, [comment.id]: isLiked}));
            setLikeCount(prev => prev + (isLiked ? 1 : -1));
            toast({ title: 'Error', description: result.error, variant: 'destructive'});
        }
    }
    
    const particleColors = ["#FFC700", "#FF0000", "#2E3192", "#455E55"];

    return (
        <button onClick={handleLikeClick} className={cn("flex items-center gap-1 hover:text-primary transition-colors relative", { 'text-red-500': isLiked })}>
            <Heart className={cn("h-4 w-4 transition-colors duration-300", isLiked ? 'fill-red-500' : '', isAnimating && 'like-button-burst')} onAnimationEnd={() => setIsAnimating(false)} />
            <span>{likeCount}</span>
            {isAnimating && (
                <div className="particle-burst animate">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="particle"
                      style={
                        {
                          '--tx': `${Math.random() * 30 - 15}px`,
                          '--ty': `${Math.random() * 30 - 15}px`,
                          'background': particleColors[i % particleColors.length],
                          'animationDelay': `${Math.random() * 0.1}s`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              )}
        </button>
    )
}

// Sub-component for rendering a single comment and its replies
const Comment = ({ 
    comment, 
    postId, 
    onUpdate,
    onDelete,
    onAdminAction,
    replies = [],
    onReply,
}: { 
    comment: CommentType, 
    postId: string,
    onUpdate: (updatedComment: CommentType) => void,
    onDelete: (commentId: string) => void,
    onAdminAction: (updatedComment: CommentType) => void,
    replies: CommentType[],
    onReply: (newReply: CommentType, parentId: string) => void,
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { user, isAdmin } = useAuth();

    const canModify = user && (user.id === comment.author.id || isAdmin);
    const isTopLevelComment = !comment.parentId;

    
    const handleDelete = async () => {
        if (!canModify || !user) return;
        setDeleteDialogOpen(false);
        const result = await deleteComment(postId, comment.id, user.id, isAdmin);
        if(result.success) {
            onDelete(comment.id);
        } else {
             toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    }

    const handleHighlight = async () => {
        if (!isAdmin) return;
        const result = await toggleCommentHighlight(postId, comment.id, isAdmin);
        if (result.success && result.updatedComment) {
            onAdminAction(result.updatedComment);
        }
    }

    const handlePin = async () => {
         if (!isAdmin) return;
        const result = await toggleCommentPin(postId, comment.id, isAdmin);
        if (result.success && result.updatedComment) {
            onAdminAction(result.updatedComment);
        }
    }
    
    const { toast } = useToast();

    return (
       <div className={cn("flex flex-col gap-4 ")}>
        <div className={cn("flex items-start gap-4 p-4 rounded-lg transition-colors duration-300 relative", {
           "bg-primary/5 border-l-4 border-primary": comment.highlighted,
        })}>
            <Dialog>
                <DialogTrigger asChild>
                    <Avatar className="cursor-pointer">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                    </Avatar>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{comment.author.name}'s Profile</DialogTitle>
                      <DialogDescription>
                        This is the profile card for {comment.author.name}. It contains their avatar, name, bio, and email if they chose to share it.
                      </DialogDescription>
                    </DialogHeader>
                    <ProfileCard user={comment.author} />
                </DialogContent>
            </Dialog>

            <div className="flex-1">
              {!isEditing ? (
                <>
                <div className="flex items-center gap-4 flex-wrap">
                     <Dialog>
                        <DialogTrigger asChild>
                             <p className="font-semibold cursor-pointer hover:underline">{comment.author.name}</p>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md p-0">
                            <DialogHeader className="sr-only">
                                <DialogTitle>{comment.author.name}'s Profile</DialogTitle>
                                <DialogDescription>
                                This is the profile card for {comment.author.name}. It contains their avatar, name, bio, and email if they chose to share it.
                                </DialogDescription>
                            </DialogHeader>
                            <ProfileCard user={comment.author} />
                        </DialogContent>
                    </Dialog>
                    <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    {comment.pinned && <Badge variant="secondary"><Pin className="h-3 w-3 mr-1" /> Pinned</Badge>}
                    {comment.highlighted && <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"><Star className="h-3 w-3 mr-1" /> Highlighted</Badge>}
                </div>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <LikeButton comment={comment} postId={postId} />
                     {isTopLevelComment && (
                        <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageSquare className="h-4 w-4"/>
                            <span>Reply</span>
                        </button>
                     )}
                </div>
                </>
              ) : (
                <CommentForm
                    postId={postId}
                    isEditing={true}
                    commentId={comment.id}
                    initialContent={comment.content}
                    onCommentAdded={(updated) => {
                        onUpdate(updated);
                        setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                    buttonText="Save"
                />
              )}

              {canModify && !isEditing && (
                  <div className="absolute top-2 right-2">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                              </DropdownMenuItem>
                                {isAdmin && (
                                    <>
                                        <DropdownMenuItem onSelect={handleHighlight}>
                                            <Star className="mr-2 h-4 w-4" />
                                            <span>{comment.highlighted ? "Unhighlight" : "Highlight"}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handlePin}>
                                            <Pin className="mr-2 h-4 w-4" />
                                            <span>{comment.pinned ? "Unpin" : "Pin"}</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                              <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
              )}
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your comment.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>

        {showReplyForm && (
            <div className="pl-14">
                <CommentForm
                    postId={postId}
                    parentId={comment.id}
                    onCommentAdded={(newReply) => {
                        onReply(newReply, comment.id);
                        setShowReplyForm(false);
                    }}
                    onCancel={() => setShowReplyForm(false)}
                    buttonText="Post Reply"
                />
            </div>
        )}

        {replies.length > 0 && (
            <Collapsible className="pl-14">
                <CollapsibleTrigger asChild>
                    <Button variant="link" size="sm" className="text-xs">View {replies.length} replies</Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                    {replies.map(reply => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onAdminAction={onAdminAction}
                            onReply={onReply}
                            replies={[]} // Nested replies not supported in this UI level
                        />
                    ))}
                </CollapsibleContent>
            </Collapsible>
        )}
       </div>
    )
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(sortComments(initialComments));
  const { user, signIn } = useAuth();
  
  const commentsWithReplies = useMemo(() => {
    const commentMap = new Map<string, CommentType & { replies: CommentType[] }>();
    const topLevelComments: (CommentType & { replies: CommentType[] })[] = [];

    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
        if (comment.parentId && commentMap.has(comment.parentId)) {
            commentMap.get(comment.parentId)?.replies.push(commentMap.get(comment.id)!);
        } else {
            topLevelComments.push(commentMap.get(comment.id)!);
        }
    });
    
    return topLevelComments;
  }, [comments]);
  
  const commentCount = comments.length;

  const updateCommentsState = (list: CommentType[], updatedComment: CommentType): CommentType[] => {
      const exists = list.some(c => c.id === updatedComment.id);
      if (exists) {
          return list.map(c => c.id === updatedComment.id ? updatedComment : c);
      }
      return [updatedComment, ...list];
  }
  
  const deleteCommentFromState = (list: CommentType[], commentId: string): CommentType[] => {
    return list.filter(c => c.id !== commentId && c.parentId !== commentId);
  }

  const addCommentToState = (newComment: CommentType) => {
      setComments(prev => sortComments([newComment, ...prev]));
  }

  const handleReplyToComment = (newReply: CommentType, parentId: string) => {
      setComments(prev => sortComments([newReply, ...prev]));
  }
  
  const handleUpdateComment = (updatedComment: CommentType) => {
      setComments(prev => sortComments(updateCommentsState(prev, updatedComment)));
  }
  
  const handleAdminAction = (updatedComment: CommentType) => {
    setComments(prev => sortComments(updateCommentsState(prev, updatedComment)));
  }
  
  const handleDeleteComment = (commentId: string) => {
      setComments(prev => deleteCommentFromState(prev, commentId));
  }
  
  return (
    <section>
      <h2 id="comments" className="text-3xl font-headline font-bold mb-8">Comments ({commentCount})</h2>
      <div className="glass-card p-6">
        {user ? (
          <CommentForm postId={postId} onCommentAdded={addCommentToState} />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You must be signed in to leave a comment.</p>
            <Button onClick={signIn}>Sign In to Comment</Button>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {commentsWithReplies.map((comment) => (
            <Comment 
                key={comment.id}
                comment={comment}
                postId={postId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onAdminAction={handleAdminAction}
                replies={comment.replies}
                onReply={handleReplyToComment}
            />
        ))}
      </div>
    </section>
  );
}
