
import { getPosts } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const staticPages = [
    { href: '/', title: 'Home' },
    { href: '/posts', title: 'All Articles' },
    { href: '/bulletin', title: 'Daily Bulletin' },
    { href: '/leaderboard', title: 'Top Readers Leaderboard' },
    { href: '/bookmarks', title: 'My Bookmarks' },
    { href: '/glare-plus', title: 'Glare+ Premium' },
    { href: '/points-system', title: 'Points & Levels System' },
    { href: '/about', title: 'About Us' },
    { href: '/contact', title: 'Contact Us' },
    { href: '/newsletter', title: 'Newsletter Subscription' },
    { href: '/privacy-policy', title: 'Privacy Policy' },
];

const SitemapPage = async () => {
    // Fetch all public posts (lightweight version)
    const posts = await getPosts(false);

    // Sort static pages alphabetically
    const sortedStaticPages = [...staticPages].sort((a, b) => a.title.localeCompare(b.title));

    // Sort blog posts alphabetically
    const sortedPostPages = posts
        .map(post => ({ href: `/posts/${post.slug}`, title: post.title }))
        .sort((a, b) => a.title.localeCompare(b.title));

    const allPages = [...sortedStaticPages, ...sortedPostPages];

    return (
        <div className="container mx-auto px-4 py-16">
            <section className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
                    Sitemap<span className="text-primary">.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    An index of all pages and articles published on Glare.
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPages.map(page => (
                    <Link
                        href={page.href}
                        key={page.href}
                        className="group relative flex items-center justify-between text-left p-4 h-16 rounded-lg border bg-card/60 text-card-foreground shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5"
                    >
                        <span className="truncate pr-4 text-sm font-medium">{page.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary opacity-0 group-hover:opacity-100" />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SitemapPage;
