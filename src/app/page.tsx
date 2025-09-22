
import Link from 'next/link';
import { ArrowRight, BrainCircuit, Rocket, SatelliteDish, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getFeaturedPosts, getRecentPosts, getTrendingPosts } from '@/lib/data';
import FeedTabs from '@/components/feed-tabs';
import AboutTheAuthor from '@/components/about-the-author';
import PopularPostCard from '@/components/popular-post-card';
import EditorsPickCard from '@/components/editors-pick-card';
import NewsletterForm from '@/components/newsletter-form';

const topics = [
    {
        icon: <SatelliteDish className="h-10 w-10 text-primary mb-4" />,
        title: "Modern Tech",
        description: "Exploring the latest trends and breakthroughs in the world of technology, from gadgets to global networks."
    },
    {
        icon: <BrainCircuit className="h-10 w-10 text-primary mb-4" />,
        title: "Artificial Intelligence",
        description: "Diving deep into the AI revolution, demystifying algorithms and exploring its impact on our future."
    },
    {
        icon: <Rocket className="h-10 w-10 text-primary mb-4" />,
        title: "Space Exploration",
        description: "Journeying through the cosmos, covering the latest missions, discoveries, and the quest to understand our universe."
    }
]

export default async function HomePage() {
  const [featuredPosts, recentPosts, trendingPosts] = await Promise.all([
    getFeaturedPosts(),
    getRecentPosts(10),
    getTrendingPosts(3)
  ]);
  
  const mainPost = featuredPosts[0];
  const secondaryPost = featuredPosts[1];
  const tertiaryPosts = featuredPosts.slice(2, 4);

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center pt-16 md:pt-24">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter mb-6">
            Cutting through the noise.
            <br />
            <span className="text-primary">Delivering clarity.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            Your essential destination for making sense of today. Sharp, focused journalism for the modern reader.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/posts">
                Explore Articles <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Editor's Picks Section */}
      {featuredPosts.length > 0 && (
        <section className="container mx-auto px-4">
          <h2 className="text-3xl font-headline font-bold mb-8 text-center">Editor's Picks</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-8 h-auto lg:h-[800px]">
            {mainPost && (
              <div className="lg:col-span-2 lg:row-span-2">
                <EditorsPickCard post={mainPost} layout="large" priority />
              </div>
            )}
            {secondaryPost && (
              <div className="lg:col-span-1 lg:row-span-1">
                <EditorsPickCard post={secondaryPost} layout="medium" priority />
              </div>
            )}
            {tertiaryPosts.length > 0 && (
              <div className="lg:col-span-1 lg:row-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                {tertiaryPosts.map(post => (
                  <EditorsPickCard key={post.id} post={post} layout="small" priority />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent Posts Section */}
      <section className="container mx-auto px-4">
        <FeedTabs recentPosts={recentPosts} />
      </section>

      {/* Newsletter Section */}
       <section className="container mx-auto px-4">
           <div className="glass-card p-8 md:p-12 lg:p-16 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden">
                <div className="text-center lg:text-left max-w-xl">
                    <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                        <Mail className="h-8 w-8 text-primary"/>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Stay Ahead of the Curve</h2>
                    <p className="text-muted-foreground mb-6 lg:mb-0">Subscribe to our newsletter for a weekly digest of our best articles, exclusive insights, and a look at what's coming next. No spam, just clarity delivered to your inbox.</p>
                </div>
                <div className="w-full max-w-md">
                    <NewsletterForm />
                </div>
           </div>
       </section>

      {/* Trending Posts Section */}
      {trendingPosts.length > 0 && (
        <section className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">Trending Posts</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Hand-picked articles that are generating buzz right now.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {trendingPosts.map((post, index) => (
                    <PopularPostCard key={post.id} post={post} rank={index + 1} />
                ))}
            </div>
        </section>
      )}

      {/* About the Developer Section */}
      <section className="container mx-auto px-4">
          <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">About the Developer</h2>
          </div>
          <div className="aurora-border rounded-2xl">
            <AboutTheAuthor />
          </div>
      </section>
    </div>
  );
}
