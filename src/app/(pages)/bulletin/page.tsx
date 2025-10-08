
'use client';
import { useState, useEffect } from 'react';
import { Bulletin, getPaginatedBulletins } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import BulletinCard from '@/components/bulletin-card';

const BulletinPage = () => {
    const [bulletins, setBulletins] = useState<Bulletin[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDocId, setLastDocId] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadInitialBulletins = async () => {
            setLoading(true);
            const { bulletins: initialBulletins, lastDocId: newLastDocId } = await getPaginatedBulletins(3, undefined, user);
            setBulletins(initialBulletins);
            setLastDocId(newLastDocId);
            setHasMore(!!newLastDocId);
            setLoading(false);
        };
        loadInitialBulletins();
    }, [user]);

    const loadMoreBulletins = async () => {
        if (!lastDocId || !hasMore) return;
        setLoadingMore(true);
        const { bulletins: newBulletins, lastDocId: newLastDocId } = await getPaginatedBulletins(3, lastDocId, user);
        setBulletins(prev => [...prev, ...newBulletins]);
        setLastDocId(newLastDocId);
        setHasMore(!!newLastDocId);
        setLoadingMore(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
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
