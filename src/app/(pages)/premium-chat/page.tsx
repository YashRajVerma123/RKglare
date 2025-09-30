'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Star, Trash2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';
import { ChatMessage, messageConverter } from '@/lib/data';
import { sendMessage, deleteMessage } from '@/app/actions/chat-actions';
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


const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const PremiumChatPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isPremium = user?.premium?.active === true;
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;
        
        const text = newMessage;
        setNewMessage('');
        
        await sendMessage(text, {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
        });
    };

    const handleDeleteMessage = async () => {
        if (!messageToDelete || !user || messageToDelete.author.id !== user.id) return;
        
        const result = await deleteMessage(messageToDelete.id);
        if (result.success) {
            toast({
                title: "Message Deleted",
            });
        } else {
            toast({
                title: "Error",
                description: result.error || "Could not delete message.",
                variant: "destructive"
            });
        }
        setMessageToDelete(null);
    };
    
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
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 group ${msg.author.id === user.id ? 'justify-end' : ''}`}>
                            {msg.author.id !== user.id && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.author.avatar} />
                                    <AvatarFallback>{getInitials(msg.author.name)}</AvatarFallback>
                                </Avatar>
                            )}
                             {msg.author.id === user.id && (
                               <div className="flex items-center self-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMessageToDelete(msg)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            )}
                            <div className={`flex flex-col ${msg.author.id === user.id ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md ${msg.author.id === user.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none'}`}>
                                    <p className="text-sm font-semibold mb-1">{msg.author.name}</p>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 px-1">
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </p>
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
