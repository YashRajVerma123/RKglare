
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Star, Trash2, Smile, MessageSquareReply, Pencil, X, MoreHorizontal, Paperclip, Users } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { ChatMessage, messageConverter, Author } from '@/lib/data';
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
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ProfileCard from '@/components/profile-card';


const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});


const PremiumChatPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isPremium = user?.premium?.active === true;
    
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [editedText, setEditedText] = useState('');
    
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

    const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
    const { toast } = useToast();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isSending, setIsSending] = useState(false);
    
    useEffect(() => {
        if (!isPremium) {
            setIsLoading(false);
            return;
        };

        const messagesCollection = collection(db, 'premium-chat').withConverter(messageConverter);
        const q = query(messagesCollection, orderBy('createdAt', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => doc.data()).reverse();
            
            const shouldScroll = messagesEndRef.current ? 
                (messagesEndRef.current.getBoundingClientRect().bottom - window.innerHeight) < 300 : true;

            setMessages(newMessages);
            setIsLoading(false);
            
            if (shouldScroll && !editingMessage) {
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }

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
    }, [isPremium, toast, editingMessage]);
    

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((newMessage.trim() === '' && !imageFile) || !user) return;
        
        setIsSending(true);

        const text = newMessage;
        const image = imageFile;

        // Reset form state immediately for better UX
        setNewMessage('');
        setImageFile(null);
        setImagePreview(null);
        setReplyingTo(null);

        let imageBase64: string | undefined = undefined;
        if (image) {
            if (image.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ title: "File too large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
                setIsSending(false);
                return;
            }
            imageBase64 = await toBase64(image);
        }

        const replyContext = replyingTo ? {
            messageId: replyingTo.id,
            authorName: replyingTo.author.name,
            text: replyingTo.text,
        } : null;
        
        await sendMessage(text, {
            id: user.id,
            name: user.name,
            avatar: user.avatar || '',
        }, replyContext, imageBase64);
        
        setIsSending(false);
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
        setReplyingTo(null);
        setEditingMessage(message);
        setEditedText(message.text);
    }

    const startReplying = (message: ChatMessage) => {
        setEditingMessage(null);
        setReplyingTo(message);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    
    if (authLoading || isLoading) {
         return (
            <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                <Loader2 className="animate-spin h-16 w-16 text-primary" />
            </div>
        );
    }
    
    if (!user || !isPremium) {
         return (
             <div className="container mx-auto px-4 py-16 text-center h-[calc(100vh-80px)] flex items-center justify-center">
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
        <div className="h-[calc(100vh-80px)] flex flex-col">
            <header className="p-4 border-b border-border/10 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-headline font-bold tracking-tight">
                        Premium Chat
                    </h1>
                    <div className="flex items-center">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        <p className="text-sm text-muted-foreground">1 member online</p>
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2 container mx-auto">
                        <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    opacity: { duration: 0.2 },
                                    layout: { type: "spring", stiffness: 260, damping: 20 }
                                }}
                                className={cn("flex items-start gap-3 group relative py-1", msg.author.id === user.id ? 'flex-row-reverse' : 'flex-row')}
                            >
                                <div className={cn(
                                "absolute top-0 z-10 flex items-center bg-card border rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity",
                                msg.author.id === user.id ? "right-12" : "left-12"
                                )}>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-full"><Smile className="h-4 w-4" /></Button>
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
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-full"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align={msg.author.id === user.id ? "end" : "start"}>
                                            <DropdownMenuItem onSelect={() => startReplying(msg)}>
                                                <MessageSquareReply className="mr-2 h-4 w-4" />
                                                <span>Reply</span>
                                            </DropdownMenuItem>
                                            {msg.author.id === user.id && (
                                                <>
                                                    <DropdownMenuItem onSelect={() => startEditing(msg)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => setMessageToDelete(msg)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Avatar className="h-8 w-8 cursor-pointer">
                                            <AvatarImage src={msg.author.avatar} />
                                            <AvatarFallback>{getInitials(msg.author.name)}</AvatarFallback>
                                        </Avatar>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md p-0">
                                       <ProfileCard user={msg.author as Author} />
                                    </DialogContent>
                                </Dialog>
                                

                                <div className={cn("flex flex-col w-full max-w-xs md:max-w-md", msg.author.id === user.id ? 'items-end' : 'items-start')}>
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl",
                                        msg.author.id === user.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background rounded-bl-none'
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
                                                <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="text-sm bg-background text-foreground focus:ring-0" autoFocus />
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingMessage(null)}>Cancel</Button>
                                                    <Button size="sm" onClick={() => handleEditMessage(msg)}>Save</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                            {msg.image && (
                                                <div className="relative aspect-video rounded-md overflow-hidden my-2">
                                                    <Image src={msg.image} alt="attached image" fill className="object-cover"/>
                                                </div>
                                            )}
                                            {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                            </>
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
                            </motion.div>
                        ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="p-4 border-t border-border/10 bg-background/50 sticky bottom-0">
                        <div className="container mx-auto">
                        <AnimatePresence>
                        {replyingTo && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center justify-between p-2 mb-2 rounded-md bg-secondary"
                            >
                                <div className="text-xs">
                                    <p className="font-semibold">Replying to {replyingTo.author.name}</p>
                                    <p className="text-muted-foreground line-clamp-1">{replyingTo.text}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </motion.div>
                        )}
                        {imagePreview && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="relative w-24 h-24 mb-2 rounded-md overflow-hidden border p-1 glass-card"
                            >
                                <Image src={imagePreview} alt="image preview" fill className="object-cover rounded-md"/>
                                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => {setImagePreview(null); setImageFile(null)}}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </motion.div>
                        )}
                        </AnimatePresence>
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 glass-card p-2 rounded-full">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                autoComplete="off"
                                className="h-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button type="submit" size="icon" className="rounded-full" disabled={isSending || (!newMessage.trim() && !imageFile)}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                        </div>
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

    