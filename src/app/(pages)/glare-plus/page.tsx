
import { getPremiumUsers, Author } from '@/lib/data';
import { Award, BadgeCheck, FileDown, MessageCircle, Star, Users, Zap } from 'lucide-react';
import GlarePlusClient from './glare-plus-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getLevel } from '@/lib/gamification';
import Link from 'next/link';

const features = [
    {
        icon: <Star className="h-6 w-6" />,
        title: "Exclusive Content",
        description: "Get 24-hour early access to articles and read premium-only posts."
    },
    {
        icon: <MessageCircle className="h-6 w-6" />,
        title: "Premium Chat",
        description: "Join a private chat room with other supporters and the author to discuss topics."
    },
    {
        icon: <FileDown className="h-6 w-6" />,
        title: "Download Articles",
        description: "Save any article as a PDF to read offline, anytime, anywhere."
    },
    {
        icon: <Zap className="h-6 w-6" />,
        title: "Ad-Free Experience",
        description: "Enjoy a faster, cleaner reading experience with all advertisements removed."
    },
    {
        icon: <Award className="h-6 w-6" />,
        title: "Supporter Badge",
        description: "Show off your support with a special Glare+ badge on your profile."
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: "Featured Supporter",
        description: "Be showcased on this page as a thank you for your incredible support."
    }
];


const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};


const SupporterCard = ({ user, rank }: { user: Author; rank: number }) => {
    const { level } = getLevel(user.points || 0);

    const rankStyles = {
        1: 'from-yellow-400 to-amber-600 border-yellow-500/50',
        2: 'from-slate-300 to-slate-500 border-slate-400/50',
        3: 'from-orange-500 to-amber-800 border-orange-600/50',
    };

    // @ts-ignore
    const rankClass = rankStyles[rank] || 'from-primary/20 to-primary/50';

    return (
        <div className={cn("glass-card p-4 rounded-xl flex flex-col items-center text-center relative overflow-hidden", rank < 4 && "aurora-border")}>
            <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-20 bg-gradient-to-bl ${rankClass}`}></div>
            <div className="relative">
                <Avatar className="h-20 w-20 mb-4 border-2 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                {rank <= 3 && (
                     <div className="absolute -top-2 -right-2 bg-background p-1.5 rounded-full">
                        <Award className={cn(
                            "h-5 w-5",
                            rank === 1 && "text-yellow-500",
                            rank === 2 && "text-slate-400",
                            rank === 3 && "text-orange-600",
                        )} />
                    </div>
                )}
                 <div className="absolute bottom-1 right-1 bg-yellow-400 p-1.5 rounded-full border-2 border-background">
                   <Star className="h-3 w-3 text-background fill-background" />
                </div>
            </div>
            <h3 className="font-headline text-lg font-semibold">{user.name}</h3>
            <div className="text-xs text-muted-foreground mt-1 mb-2 flex items-center gap-1.5">
                <level.icon className="h-4 w-4" style={{color: level.color}}/>
                <span style={{color: level.color}}>{level.name}</span>
            </div>
            <p className="text-sm font-bold font-mono text-primary">{(user.points || 0).toLocaleString()} PTS</p>
        </div>
    );
};


const GlarePlusPage = async () => {

    const supporters = await getPremiumUsers();

    return (
        <div className="container mx-auto px-4 py-16">
            <section className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
                    Become a <span className="bg-gradient-to-r from-yellow-400 to-primary bg-clip-text text-transparent">Glare+</span> Supporter
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Unlock exclusive benefits, support our work, and get recognized for your dedication.
                </p>
            </section>
            
            <section className="mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="glass-card text-center p-8 transition-transform transform hover:-translate-y-2">
                        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4 text-primary">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-headline font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <GlarePlusClient />

            <section className="mt-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Supporters</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">A huge thank you to our Glare+ members for keeping this community thriving.</p>
                </div>
                {supporters.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {supporters.map((user, index) => (
                           <SupporterCard key={user.id} user={user} rank={index+1} />
                        ))}
                    </div>
                ) : (
                    <Card className="glass-card text-center py-16">
                         <CardHeader>
                            <CardTitle>Be the First Supporter!</CardTitle>
                            <CardDescription>
                                The supporter wall is waiting for its first hero. Purchase a Glare+ plan to be featured here.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </section>
        </div>
    );
};

export default GlarePlusPage;
