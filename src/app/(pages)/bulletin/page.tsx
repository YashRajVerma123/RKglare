
'use client';
import { useState, useEffect } from 'react';
import { Bulletin, getBulletins } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2 } from 'lucide-react';
import Image from 'next/image';

const BulletinCard = ({ bulletin, index }: { bulletin: Bulletin; index: number }) => {
    const isReversed = index % 2 !== 0;

    return (
        <div className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
             <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-border/50 hidden md:block"></div>
             <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-4 border-background hidden md:block"></div>

            <div className={isReversed ? 'md:order-2' : ''}>
                {bulletin.coverImage && (
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-border/10">
                        <Image
                            src={bulletin.coverImage}
                            alt={bulletin.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
            </div>
            <div className={`glass-card p-6 rounded-xl md:order-1 ${isReversed ? 'md:text-right' : ''}`}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(bulletin.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-3 text-primary">{bulletin.title}</h3>
                <p className="text-muted-foreground">{bulletin.content}</p>
            </div>
        </div>
    )
}

const BulletinPage = () => {
    const [bulletins, setBulletins] = useState<Bulletin[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDocId, setLastDocId] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const loadInitialBulletins = async () => {
            setLoading(true);
            const { bulletins: initialBulletins, lastDocId: newLastDocId } = await getBulletins(3);
            setBulletins(initialBulletins);
            setLastDocId(newLastDocId);
            setHasMore(!!newLastDocId);
            setLoading(false);
        };
        loadInitialBulletins();
    }, []);

    const loadMoreBulletins = async () => {
        if (!lastDocId || !hasMore) return;
        setLoadingMore(true);
        const { bulletins: newBulletins, lastDocId: newLastDocId } = await getBulletins(3, lastDocId);
        setBulletins(prev => [...prev, ...newBulletins]);
        setLastDocId(newLastDocId);
        setHasMore(!!newLastDocId);
        setLoadingMore(false);
    };

    if (loading) {
        return null;
    }
    
    return (
        <div className="container mx-auto px-4 py-16">
            <section className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
                    Daily Bulletin<span className="text-primary">.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Your daily digest of what's happening. Quick updates, straight to the point.
                </p>
            </section>
            
            <div className="max-w-4xl mx-auto space-y-12">
               {bulletins.map((bulletin, index) => (
                   <BulletinCard key={bulletin.id} bulletin={bulletin} index={index} />
               ))}
            </div>

            {hasMore && (
                <div className="text-center mt-16">
                    <Button onClick={loadMoreBulletins} disabled={loadingMore}>
                        {loadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Show More'
                        )}
                    </Button>
                </div>
            )}
             {bulletins.length > 0 && !hasMore && (
                 <p className="text-center mt-16 text-muted-foreground">You've reached the end.</p>
             )}

             {bulletins.length === 0 && !loading && (
                 <p className="text-center mt-16 text-muted-foreground">No bulletins have been posted yet.</p>
             )}
        </div>
    );
}

export default BulletinPage;
