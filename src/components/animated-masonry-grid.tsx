
'use client';
import { cn } from "@/lib/utils";
import React from "react";
import { Star, Palette, MessageSquare, FileDown, Zap, Award, Users, LifeBuoy } from "lucide-react";

const features = [
    {
        icon: <Star className="h-8 w-8" />,
        title: "Exclusive Content",
        description: "Get early access and read premium-only posts."
    },
    {
        icon: <Palette className="h-8 w-8" />,
        title: "Customizable UI",
        description: "Personalize your reading experience."
    },
    {
        icon: <MessageSquare className="h-8 w-8" />,
        title: "Premium Chat",
        description: "Join a private chat with other supporters."
    },
    {
        icon: <FileDown className="h-8 w-8" />,
        title: "Download Articles",
        description: "Save any article as a PDF to read offline."
    },
    {
        icon: <Zap className="h-8 w-8" />,
        title: "Ad-Free Experience",
        description: "Enjoy a faster, cleaner reading experience."
    },
    {
        icon: <Award className="h-8 w-8" />,
        title: "Supporter Badge",
        description: "Show off your support with a badge on your profile."
    },
    {
        icon: <Users className="h-8 w-8" />,
        title: "Featured Supporter",
        description: "Be showcased on the Glare+ page."
    },
     {
        icon: <LifeBuoy className="h-8 w-8" />,
        title: "Priority Support",
        description: "Get faster responses for any issues."
    },
     {
        icon: <Star className="h-8 w-8" />,
        title: "More Rewards",
        description: "Unlock special challenges and point bonuses."
    },
];

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) => {
  return (
    <div className="glass-card text-center p-8 flex flex-col items-center justify-center gap-4 h-56">
        <div className="inline-block p-4 bg-primary/10 rounded-full text-primary">
            {icon}
        </div>
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-headline font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    </div>
  );
};

const AnimatedMasonryGrid = () => {
    const column1 = features.slice(0, 3);
    const column2 = features.slice(3, 6);
    const column3 = features.slice(6, 9);

    const renderColumn = (columnFeatures: typeof features) => (
        <div className="flex flex-col space-y-4">
            {columnFeatures.map((feature, i) => (
                <FeatureCard key={i} {...feature} />
            ))}
        </div>
    );

    return (
        <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden">
            <div className="flex w-full justify-center gap-4">
                <div className="w-1/3 animate-marquee-vertical space-y-4">
                   {renderColumn(column1)}
                   {renderColumn(column1)}
                </div>
                 <div className="w-1/3 animate-marquee-vertical [animation-direction:reverse] space-y-4">
                    {renderColumn(column2)}
                    {renderColumn(column2)}
                </div>
                 <div className="w-1/3 animate-marquee-vertical space-y-4">
                    {renderColumn(column3)}
                    {renderColumn(column3)}
                </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-b from-background via-transparent to-background"></div>
        </div>
    );
};

export default AnimatedMasonryGrid;
