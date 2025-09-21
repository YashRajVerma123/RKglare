
'use client';
import { Mail } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          Get In Touch<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Have a question, a story tip, or feedback? We'd love to hear from you.
        </p>
      </section>

      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 group relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
           <div className="relative flex flex-col items-center justify-center text-center">
             <div className="p-4 bg-primary/10 rounded-full mb-6">
                <Mail className="h-10 w-10 text-primary" />
             </div>
             <h2 className="text-2xl font-headline font-bold mb-4">Our Inbox is Always Open</h2>
             <p className="text-muted-foreground mb-6">
                For the fastest response, please send us an email. We typically reply within 24 hours.
             </p>
             <div 
                className="font-mono text-lg text-primary bg-secondary/50 px-6 py-3 rounded-lg tracking-widest animate-text-shine"
                style={{
                  animation: 'text-shine 2s linear infinite',
                  background: 'linear-gradient(110deg, transparent 20%, hsl(var(--primary)) 50%, transparent 80%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
             >
                help.novablog@gmail.com
             </div>
           </div>
        </div>
      </div>
       <style jsx>{`
        @keyframes text-shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
