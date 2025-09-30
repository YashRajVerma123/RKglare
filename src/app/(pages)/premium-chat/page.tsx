
import { MessageSquare } from "lucide-react";

const PremiumChatPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          Premium Chat<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          This is an exclusive space for Glare+ supporters to connect.
        </p>
      </section>

      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-12 text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-bold mb-4">Coming Soon!</h2>
          <p className="text-muted-foreground">
            We are hard at work building a real-time chat experience for our premium members.
            You'll be able to discuss articles, share ideas, and connect with the author and other supporters. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumChatPage;
