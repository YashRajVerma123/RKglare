'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { MessageSquare, Send, X, Loader2, ArrowDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { SupportChatMessage } from '@/lib/data';
import { sendSupportMessage } from '@/app/actions/support-chat-actions';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

export default function SupportChatWidget() {
    const { user, loading: authLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<SupportChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !isOpen) return;

        setIsLoading(true);
        const messagesCol = collection(db, 'supportChats', user.id, 'messages');
        const q = query(messagesCol, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportChatMessage));
            setMessages(newMessages);
            setIsLoading(false);
            scrollToBottom();
        }, (error) => {
            console.error("Error fetching support messages:", error);
            toast({ title: "Error", description: "Could not load chat history.", variant: "destructive"});
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, isOpen, toast]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;
        
        setIsSending(true);
        const text = newMessage;
        setNewMessage('');
        
        try {
            const result = await sendSupportMessage(user.id, user.name, user.avatar, text, 'user');
            if (result.error) throw new Error(result.error);
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive"});
            setNewMessage(text); // Put message back on error
        } finally {
            setIsSending(false);
        }
    };

    if (authLoading || !user) {
        return null;
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                 <Button
                    className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl"
                    size="icon"
                >
                    {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                side="top" 
                align="end" 
                className="w-[calc(100vw-2rem)] sm:w-96 h-[60vh] p-0 flex flex-col glass-card"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <header className="p-4 border-b border-border/10 flex items-center justify-between shrink-0">
                    <h3 className="font-headline font-semibold">Support Chat</h3>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">{user.name}</p>
                    </div>
                </header>
                <div className="flex-1 p-4 overflow-y-auto relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : messages.length > 0 ? (
                        <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                                {msg.sender === 'admin' && (
                                     <Avatar className="h-6 w-6">
                                        <AvatarFallback>A</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 text-sm", 
                                    msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                                )}>
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground h-full flex flex-col items-center justify-center">
                            <MessageSquare className="h-12 w-12 mb-4" />
                            <p>Have a question or need help? Send us a message!</p>
                        </div>
                    )}
                </div>
                 <form onSubmit={handleSendMessage} className="p-4 border-t border-border/10 flex items-center gap-2 shrink-0">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isSending}
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </PopoverContent>
        </Popover>
    );
}