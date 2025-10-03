
import { Award, FileText, Globe, Users } from "lucide-react";
import { Newspaper, Rss, ShieldCheck } from "lucide-react";
import Counter from "@/components/counter";
import ParallaxContainer from "@/components/parallax-container";

const features = [
  {
    icon: <Newspaper className="h-8 w-8 text-primary" />,
    title: "In-Depth Analysis",
    description: "We go beyond the headlines to provide context and analysis, helping you understand the 'why' behind the news.",
  },
  {
    icon: <Rss className="h-8 w-8 text-primary" />,
    title: "Always Current",
    description: "Our team works around the clock to bring you the latest developments as they happen.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Unbiased Reporting",
    description: "We are committed to fair and impartial journalism, presenting all sides of the story.",
  },
];

const stats = [
    { icon: <FileText className="h-10 w-10 text-primary" />, value: 100, label: "Articles Published", suffix: "+" },
    { icon: <Globe className="h-10 w-10 text-primary" />, value: 24, label: "News Coverage", suffix: "/7" },
    { icon: <Users className="h-10 w-10 text-primary" />, value: 50, label: "Monthly Readers", suffix:"k+" },
    { icon: <Award className="h-10 w-10 text-primary" />, value: 10, label: "Expert Authors", suffix:"+" },
];

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <ParallaxContainer>
        <section className="text-center mb-24 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
            About Glare<span className="text-primary">.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Cutting through the noise, delivering clarity. We are your essential destination for making sense of today's complex world.
          </p>
        </section>
      </ParallaxContainer>

      <section className="mb-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Core Principles</h2>
            <p className="text-muted-foreground mt-2">What drives us to deliver the best content.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass-card text-center p-8 transition-transform transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
         <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Journey in Numbers</h2>
            <p className="text-muted-foreground mt-2">The impact we're making, one story at a time.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
               <div className="absolute -top-4 -right-4 h-16 w-16 bg-primary/5 rounded-full blur-lg"></div>
              <div className="mb-4">{stat.icon}</div>
              <div className="text-4xl font-bold font-headline text-primary">
                <Counter to={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;

    