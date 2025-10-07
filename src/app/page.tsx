
import Link from 'next/link';
import { ArrowRight, BrainCircuit, Cpu, Dna, Rocket, SatelliteDish, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getFeaturedPosts, getRecentPosts, getTrendingPosts } from '@/lib/firebase-server';
import FeedTabs from '@/components/feed-tabs';
import AboutTheAuthor from '@/components/about-the-author';
import PopularPostCard from '@/components/popular-post-card';
import EditorsPickCard from '@/components/editors-pick-card';
import Marquee from '@/components/ui/marquee';
import { Badge } from '@/components/ui/badge';
import ParallaxContainer from '@/components/parallax-container';

const topics = [
    { icon: <SatelliteDish className="h-5 w-5" />, title: "Modern Tech" },
    { icon: <BrainCircuit className="h-5 w-5" />, title: "Artificial Intelligence" },
    { icon: <Rocket className="h-5 w-5" />, title: "Space Exploration" },
    { icon: <Cpu className="h-5 w-5" />, title: "Quantum Computing" },
    { icon: <Dna className="h-5 w-5" />, title: "Biotechnology" },
];

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

      {/* Featured Posts Bento Grid */}
      {featuredPosts.length > 0 && (
          <section className="container mx-auto px-4">
               <h2 className="text-3xl font-headline font-bold mb-8 text-center">Editor's Picks</h2>
               <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 md:h-[600px]">
                    {mainPost && (
                        <div className="md:col-span-2 md:row-span-2">
                           <ParallaxContainer>
                            <EditorsPickCard post={mainPost} layout="large" priority />
                           </ParallaxContainer>
                        </div>
                    )}
                    {secondaryPost && (
                         <div className="md:col-span-2 md:row-span-1">
                           <ParallaxContainer>
                            <EditorsPickCard post={secondaryPost} layout="medium" priority />
                           </ParallaxContainer>
                        </div>
                    )}
                    {tertiaryPosts.map((post) => (
                        <div key={post.id} className="md:col-span-1 md:row-span-1">
                            <ParallaxContainer>
                             <EditorsPickCard post={post} layout="small" />
                            </ParallaxContainer>
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

      {/* Marquee Section */}
      <section className="relative w-full py-12">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Covering What Matters</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">We focus on the subjects that are shaping tomorrow, today.</p>
        </div>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background/50 py-8 md:py-12">
          <Marquee className="[--gap:3rem]">
            {topics.map((topic) => (
              <div key={topic.title} className="flex items-center gap-3 text-xl font-semibold text-muted-foreground mx-4">
                {topic.icon}
                <span>{topic.title}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* About the Author Section */}
      <section className="container mx-auto px-4">
        <AboutTheAuthor />
      </section>

    </div>
  );
}
