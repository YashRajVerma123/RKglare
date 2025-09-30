
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Star, Trash2, Smile, MessageSquareReply, Pencil, X } from 'lucide-react';
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
        await toggleReaction(message.id, emoji, user.id);
    }
    
    const startEditing = (message: ChatMessage) => {
        setEditingMessage(message);
        setEditedText(message.text);
    }
    
    if (authLoading || isLoading) {
         return (
            <div className="flex h-[80vh] items-center justify-center">
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
        <>
        <div className="container mx-auto px-4 py-16 h-[90vh] flex flex-col">
            <section className="text-center mb-8 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
                Premium Chat<span className="text-primary">.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                An exclusive space for Glare+ supporters to connect and discuss.
                </p>
            </section>
            
            <div className="glass-card flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-start gap-3 group relative py-1", msg.author.id === user.id ? 'justify-end' : '')}>
                           
                           {/* Hover Menu */}
                           <div className={cn(
                               "absolute top-0 z-10 flex items-center bg-background border rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity",
                               msg.author.id === user.id ? 'right-12' : 'left-12'
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
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setReplyingTo(msg)}><MessageSquareReply className="h-4 w-4" /></Button>
                               {msg.author.id === user.id && (
                                   <>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing(msg)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMessageToDelete(msg)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                   </>
                               )}
                           </div>
                           
                            {msg.author.id !== user.id && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.author.avatar} />
                                    <AvatarFallback>{getInitials(msg.author.name)}</AvatarFallback>
                                </Avatar>
                            )}

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

                            {msg.author.id === user.id && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.author.avatar} />
                                    <AvatarFallback>{getInitials(msg.author.name)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-border/10 bg-background/50">
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
                    <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            autoComplete="off"
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
        </>
    );
};

export default PremiumChatPage;
