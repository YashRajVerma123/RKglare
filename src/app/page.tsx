
import Link from 'next/link';
import { ArrowRight, BrainCircuit, Rocket, SatelliteDish } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getFeaturedPosts, getRecentPosts, getTrendingPosts } from '@/lib/data';
import FeedTabs from '@/components/feed-tabs';
import AboutTheAuthor from '@/components/about-the-author';
import PopularPostCard from '@/components/popular-post-card';
import EditorsPickCard from '@/components/editors-pick-card';
import Marquee from '@/components/ui/marquee';
import { Badge } from '@/components/ui/badge';

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
    getTrendingPosts()
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

      {/* Marquee Section */}
      <section className="relative w-full">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Glare?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">We focus on the subjects that are shaping tomorrow, today.</p>
        </div>
        <Marquee pauseOnHover className="[--duration:60s]">
            {topics.map((topic) => (
                <div key={topic.title} className="glass-card text-center p-8 transition-transform transform hover:-translate-y-2 w-72 h-full flex flex-col">
                    <div className="flex-shrink-0 inline-block p-4 bg-primary/10 rounded-full mb-4 mx-auto">
                        {topic.icon}
                    </div>
                    <h3 className="text-xl font-headline font-semibold mb-2">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm flex-grow">{topic.description}</p>
                </div>
            ))}
        </Marquee>
      </section>

      {/* Featured Posts Bento Grid */}
      {featuredPosts.length > 0 && (
          <section className="container mx-auto px-4">
               <h2 className="text-3xl font-headline font-bold mb-8 text-center">Editor's Picks</h2>
               <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 md:h-[600px]">
                    {mainPost && (
                        <div className="md:col-span-2 md:row-span-2">
                            <EditorsPickCard post={mainPost} layout="large" priority />
                        </div>
                    )}
                    {secondaryPost && (
                         <div className="md:col-span-2 md:row-span-1">
                            <EditorsPickCard post={secondaryPost} layout="medium" priority />
                        </div>
                    )}
                    {tertiaryPosts.map((post) => (
                        <div key={post.id} className="md:col-span-1 md:row-span-1">
                             <EditorsPickCard post={post} layout="small" />
                        </div>
                    ))}
               </div>
          </section>
      )}

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

      {/* Recent Posts Section */}
      <section className="container mx-auto px-4">
        <FeedTabs recentPosts={recentPosts} />
      </section>

      {/* Why Glare? Section */}
      <section className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Glare?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">We focus on the subjects that are shaping tomorrow, today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topics.map((topic, index) => (
                  <div key={index} className="glass-card text-center p-8 transition-transform transform hover:-translate-y-2">
                      <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                          {topic.icon}
                      </div>
                      <h3 className="text-xl font-headline font-semibold mb-2">{topic.title}</h3>
                      <p className="text-muted-foreground text-sm">{topic.description}</p>
                  </div>
              ))}
          </div>
      </section>

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
