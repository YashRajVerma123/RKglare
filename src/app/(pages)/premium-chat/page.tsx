
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Star, Trash2, Smile, MessageSquareReply, Pencil, X, MoreHorizontal, Paperclip } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { ChatMessage, messageConverter } from '@/lib/data';
import { sendMessage, deleteMessage, editMessage, toggleReaction } from '@/app/actions/chat-actions';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
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
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const PremiumChatPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isPremium = user?.premium?.active === true;
    
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [editedText, setEditedText] = useState('');
    
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

    const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        if (!isPremium) {
            setIsLoading(false);
            return;
        };

        const messagesCollection = collection(db, 'premium-chat').withConverter(messageConverter);
        const q = query(messagesCollection, orderBy('createdAt', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => doc.data()).reverse();
            setMessages(newMessages);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setIsLoading(false);
            toast({
                title: "Error",
                description: "Could not fetch chat messages.",
                variant: "destructive"
            });
        });

        return () => unsubscribe();
    }, [isPremium, toast]);
    
     useEffect(() => {
        // Only scroll to bottom if not editing a message
        if (!editingMessage) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, editingMessage]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;
        
        const text = newMessage;
        setNewMessage('');

        const replyContext = replyingTo ? {
            messageId: replyingTo.id,
            authorName: replyingTo.author.name,
            text: replyingTo.text,
        } : null;
        
        await sendMessage(text, {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
        }, replyContext);
        setReplyingTo(null);
    };

    const handleDeleteMessage = async () => {
        if (!messageToDelete || !user) return;
        
        const result = await deleteMessage(messageToDelete.id, user.id);
        if (result.success) {
            toast({ title: "Message Deleted" });
        } else {
            toast({ title: "Error", description: result.error || "Could not delete message.", variant: "destructive" });
        }
        setMessageToDelete(null);
    };

    const handleEditMessage = async (message: ChatMessage) => {
        if (editedText.trim() === '' || editedText === message.text) {
            setEditingMessage(null);
            return;
        }
        await editMessage(message.id, editedText, user!.id);
        setEditingMessage(null);
    }
    
    const handleToggleReaction = async (message: ChatMessage, emoji: string) => {
        if (!user) return;
        // The action itself will not cause a scroll. The onSnapshot listener will,
        // and we prevent that by checking for `editingMessage`, which is not ideal.
        // A better approach is to not scroll if the user is not at the bottom.
        // For now, this is a compromise. We can refine it if needed.
        await toggleReaction(message.id, emoji, user.id);
    }
    
    const startEditing = (message: ChatMessage) => {
        setEditingMessage(message);
        setEditedText(message.text);
    }
    
    if (authLoading || isLoading) {
         return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-16 w-16 text-primary" />
            </div>
        );
    }
    
    if (!user || !isPremium) {
         return (
             <div className="container mx-auto px-4 py-16 text-center">
                <div className="glass-card p-12 max-w-2xl mx-auto">
                     <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl font-headline font-bold mb-4">Glare+ Exclusive</h1>
                    <p className="text-muted-foreground mb-6">You must be a Glare+ subscriber to access the premium chat.</p>
                    <Button asChild>
                        <Link href="/glare-plus">Explore Glare+</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-border/10 bg-background/50 backdrop-blur-sm sticky top-20 z-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-headline font-bold tracking-tight text-center">
                    Premium Chat
                    </h1>
                </div>
            </header>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2 container mx-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-start gap-3 group relative py-1", msg.author.id === user.id ? 'flex-row-reverse' : 'flex-row')}>
                           
                           {/* Hover Menu */}
                            <div className={cn(
                               "absolute top-0 z-10 flex items-center bg-card border rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity",
                               msg.author.id === user.id ? "right-12" : "left-12"
                            )}>
                               <Popover>
                                   <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7"><Smile className="h-4 w-4" /></Button>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-auto p-1">
                                       <div className="flex gap-1">
                                           {EMOJIS.map(emoji => (
                                               <Button key={emoji} variant="ghost" size="icon" className="h-8 w-8 text-lg" onClick={() => handleToggleReaction(msg, emoji)}>
                                                   {emoji}
                                               </Button>
                                           ))}
                                       </div>
                                   </PopoverContent>
                               </Popover>
                               
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={msg.author.id === user.id ? "end" : "start"}>
                                        <DropdownMenuItem onSelect={() => setReplyingTo(msg)}>
                                            <MessageSquareReply className="mr-2 h-4 w-4" />
                                            <span>Reply</span>
                                        </DropdownMenuItem>
                                        {msg.author.id === user.id && (
                                            <>
                                                <DropdownMenuItem onSelect={() => startEditing(msg)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setMessageToDelete(msg)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                           </div>
                           
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.author.avatar} />
                                <AvatarFallback>{getInitials(msg.author.name)}</AvatarFallback>
                            </Avatar>
                            

                            <div className={cn("flex flex-col w-full max-w-xs md:max-w-md", msg.author.id === user.id ? 'items-end' : 'items-start')}>
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl",
                                    msg.author.id === user.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none'
                                )}>
                                    <p className="text-sm font-semibold mb-1">{msg.author.name}</p>
                                    {msg.replyTo && (
                                        <div className="p-2 mb-2 rounded-md bg-black/20 opacity-80">
                                            <p className="text-xs font-bold">{msg.replyTo.authorName}</p>
                                            <p className="text-xs line-clamp-2">{msg.replyTo.text}</p>
                                        </div>
                                    )}

                                    {editingMessage?.id === msg.id ? (
                                        <div className="space-y-2">
                                            <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="text-sm text-background bg-foreground/80 focus:ring-0" autoFocus />
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingMessage(null)}>Cancel</Button>
                                                <Button size="sm" onClick={() => handleEditMessage(msg)}>Save</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <p className="text-xs text-muted-foreground mt-1 px-1">
                                        {msg.isEdited && `(edited) `}
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                            <Button key={emoji} variant="secondary" size="sm" className={cn("h-6 px-2 rounded-full", userIds.includes(user.id) && "border-primary")} onClick={() => handleToggleReaction(msg, emoji)}>
                                                {emoji} <span className="text-xs ml-1">{userIds.length}</span>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-border/10 bg-background/50 sticky bottom-0">
                    <div className="container mx-auto">
                        {replyingTo && (
                            <div className="flex items-center justify-between p-2 mb-2 rounded-md bg-secondary">
                                <div className="text-xs">
                                    <p className="font-semibold">Replying to {replyingTo.author.name}</p>
                                    <p className="text-muted-foreground line-clamp-1">{replyingTo.text}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" onClick={() => toast({title: "File attachments coming soon!", description: "This feature is currently under development."})}>
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                autoComplete="off"
                                className="h-10"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <AlertDialog open={!!messageToDelete} onOpenChange={(isOpen) => !isOpen && setMessageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your message.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PremiumChatPage;

    