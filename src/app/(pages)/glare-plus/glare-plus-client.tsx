
'use client';

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Award, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { purchaseSubscription } from "@/app/actions/premium-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const subscriptionOptions = {
    '7_days': { points: 300, days: 7, title: "1 Week Pass" },
    '30_days': { points: 1000, days: 30, title: "1 Month Pass" },
};

type PlanKey = keyof typeof subscriptionOptions;

const GlarePlusClient = () => {
    const { user, refreshUser, signIn } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<PlanKey | null>(null);
    const [showThanksDialog, setShowThanksDialog] = useState(false);

    const handlePurchase = async (plan: PlanKey) => {
        if (!user) {
            signIn();
            return;
        }

        const option = subscriptionOptions[plan];
        if ((user.points || 0) < option.points) {
            toast({
                title: "Not Enough Points",
                description: `You need ${option.points.toLocaleString()} points for this plan. You have ${(user.points || 0).toLocaleString()}.`,
                variant: "destructive"
            });
            return;
        }
        
        setIsLoading(plan);
        const result = await purchaseSubscription(user.id, plan);
        setIsLoading(null);

        if (result.success) {
            setShowThanksDialog(true);
            await refreshUser();
        } else {
            toast({
                title: "Purchase Failed",
                description: result.error || "An unknown error occurred. Please try again.",
                variant: "destructive"
            });
        }
    };

    const isPremium = user?.premium?.active === true && user.premium.expires && new Date(user.premium.expires) > new Date();
    const expiresDate = user?.premium?.expires ? new Date(user.premium.expires).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : null;

    return (
        <section>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">Join Glare+</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Use your hard-earned points to unlock premium benefits.</p>
            </div>

            {isPremium && expiresDate ? (
                <Card className="glass-card max-w-2xl mx-auto text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                             <Award className="h-6 w-6 text-yellow-500" /> You are a Glare+ Supporter!
                        </CardTitle>
                        <CardDescription>
                            Your subscription is active until {expiresDate}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>You can extend your subscription by purchasing another plan below.</p>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
                {Object.entries(subscriptionOptions).map(([key, option]) => (
                    <Card key={key} className="glass-card flex flex-col">
                         <CardHeader>
                            <CardTitle>{option.title}</CardTitle>
                            <CardDescription>Get all Glare+ benefits for {option.days} days.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <p className="text-4xl font-bold text-primary font-headline">{option.points.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">Points</span></p>
                        </CardContent>
                        <CardFooter>
                             <Button 
                                className="w-full" 
                                onClick={() => handlePurchase(key as PlanKey)}
                                disabled={!!isLoading}
                            >
                                {isLoading === key ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                ) : 'Purchase'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

             <AlertDialog open={showThanksDialog} onOpenChange={setShowThanksDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <Check className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-center text-2xl font-headline">Thank You for Your Support!</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            You are now a Glare+ supporter. All premium features have been unlocked for your account. Enjoy!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-center">
                        <AlertDialogAction onClick={() => setShowThanksDialog(false)}>Continue</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
};

export default GlarePlusClient;
