
import { Bulletin } from '@/lib/data';
import { Calendar } from 'lucide-react';
import Image from 'next/image';

export const BulletinCard = ({ bulletin, index }: { bulletin: Bulletin; index: number }) => {
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

export default BulletinCard;
