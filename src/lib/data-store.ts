
// This file now only contains the initial raw data for seeding the database.
import { Post, Comment, Author, Notification, Bulletin, DiaryEntry } from './data';

const yashRaj: Author = { id: 'yash-raj', name: 'Yash Raj', username: 'yash.raj', avatar: 'https://i.pravatar.cc/150?u=yash-raj', email: 'yashrajverma916@gmail.com'};
const janeDoe: Author = { id: 'jane-doe', name: 'Jane Doe', username: 'jane.doe', avatar: 'https://i.pravatar.cc/150?u=jane-doe', email: 'jane.doe@example.com'};
const johnSmith: Author = { id: 'john-smith', name: 'John Smith', username: 'john.smith', avatar: 'https://i.pravatar.cc/150?u=john-smith', email: 'john.smith@example.com'};

type PostSeedData = Omit<Post, 'id' | 'comments'> & { comments?: Omit<Comment, 'id'>[] }

export const initialPostsData: PostSeedData[] = [
    {
        slug: 'the-future-of-ai',
        title: 'The Future of Artificial Intelligence: Predictions and Possibilities',
        description: 'A deep dive into the evolving landscape of AI and what we can expect in the coming years.',
        content: `
        <p>Artificial Intelligence is no longer a concept confined to science fiction. It's here, and it's reshaping our world in profound ways. From healthcare to finance, AI is driving innovation and efficiency. This post explores the trajectory of AI, examining its potential to solve some of humanity's greatest challenges.</p>
        <img src="https://picsum.photos/800/400?random=1" data-ai-hint="AI technology" alt="AI" class="rounded-lg my-6" />
        <h3 class="text-2xl font-headline font-bold mt-8 mb-4">The Next Wave of Innovation</h3>
        <p>Generative AI models are becoming increasingly sophisticated, capable of creating text, images, and even code that is indistinguishable from human-created content. This opens up new frontiers for creativity and automation. However, it also raises important ethical questions that society must address.</p>
        `,
        coverImage: 'https://picsum.photos/1200/800?random=1',
        author: janeDoe,
        publishedAt: '2024-07-28T10:00:00Z',
        tags: ['AI', 'Technology', 'Future'],
        readTime: 10,
        featured: true,
        likes: 25,
        comments: [
            { content: 'Great overview of the future of AI!', author: yashRaj, createdAt: '2024-07-28T12:00:00Z', likes: 15, parentId: null }
        ],
    },
    {
        slug: 'sustainable-living-guide',
        title: 'A Practical Guide to Sustainable Living',
        description: 'Small changes can make a big impact. Discover practical tips for a more sustainable lifestyle.',
        content: `
        <p>Sustainability is about meeting our own needs without compromising the ability of future generations to meet theirs. This guide provides actionable steps you can take today to reduce your environmental footprint.</p>
        <h3 class="text-2xl font-headline font-bold mt-8 mb-4">Reduce, Reuse, Recycle</h3>
        <p>The three R's are a cornerstone of sustainable living. We'll explore how to effectively implement these principles in your daily routine, from composting food scraps to choosing reusable products over single-use items.</p>
        <img src="https://picsum.photos/800/400?random=2" data-ai-hint="nature environment" alt="Sustainable Living" class="rounded-lg my-6" />
        `,
        coverImage: 'https://picsum.photos/1200/800?random=2',
        author: johnSmith,
        publishedAt: '2024-07-27T14:30:00Z',
        tags: ['Sustainability', 'Lifestyle', 'Environment'],
        readTime: 8,
        featured: true,
        likes: 42,
        comments: [],
    },
    {
        slug: 'mastering-remote-work',
        title: 'Mastering Remote Work: Tips for Productivity and Well-being',
        description: 'The shift to remote work is here to stay. Learn how to thrive in a work-from-home environment.',
        content: `
        <p>Working remotely offers flexibility but also presents unique challenges. This article provides evidence-based strategies for staying productive, connected, and mentally healthy while working from home.</p>
        <h3 class="text-2xl font-headline font-bold mt-8 mb-4">Creating Your Ideal Workspace</h3>
        <p>Your environment plays a significant role in your productivity. We discuss how to set up an ergonomic and distraction-free workspace that fosters focus and creativity.</p>
        <img src="https://picsum.photos/800/400?random=3" data-ai-hint="home office" alt="Remote Work" class="rounded-lg my-6" />
        `,
        coverImage: 'https://picsum.photos/1200/800?random=3',
        author: yashRaj,
        publishedAt: '2024-07-26T09:00:00Z',
        tags: ['Remote Work', 'Productivity', 'Wellness'],
        readTime: 5,
        featured: false,
        likes: 18,
        comments: [],
    },
    {
        slug: 'the-art-of-minimalism',
        title: 'The Art of Minimalism: Less is More',
        description: 'Explore the philosophy of minimalism and how it can lead to a more meaningful life.',
        content: `
        <p>Minimalism isn't just about decluttering your home; it's a mindset. It's about intentionally living with only the things you really need—those items that support your purpose. </p>
        <img src="https://picsum.photos/800/400?random=4" data-ai-hint="minimalist interior" alt="Minimalism" class="rounded-lg my-6" />
        <p>By clearing the clutter from our lives, we can make room for what's most important: happiness, fulfillment, and freedom.</p>
        `,
        coverImage: 'https://picsum.photos/1200/800?random=4',
        author: janeDoe,
        publishedAt: '2024-07-25T18:00:00Z',
        tags: ['Minimalism', 'Lifestyle', 'Philosophy'],
        readTime: 7,
        featured: true,
        likes: 55,
        comments: [],
    },
    {
        slug: 'exploring-the-deep-sea',
        title: 'Into the Abyss: Exploring the Mysteries of the Deep Sea',
        description: 'The deep sea is the last true frontier on Earth. Discover the strange and wonderful creatures that inhabit it.',
        content: `
        <p>More than 80 percent of our ocean is unmapped, unobserved, and unexplored. The deep sea is a world of crushing pressure, freezing temperatures, and eternal darkness. Yet, life finds a way.</p>
        <img src="https://picsum.photos/800/400?random=5" data-ai-hint="underwater ocean" alt="Deep Sea" class="rounded-lg my-6" />
        <p>From bioluminescent jellyfish to giant squid, we're just beginning to understand the incredible biodiversity of the deep ocean. Join us on a journey to this mysterious realm.</p>
        `,
        coverImage: 'https://picsum.photos/1200/800?random=5',
        author: johnSmith,
        publishedAt: '2024-07-24T12:00:00Z'
        ,
        tags: ['Ocean', 'Science', 'Exploration'],
        readTime: 9,
        featured: false,
        likes: 30,
        comments: [],
    },
];

export const initialNotificationsData: Omit<Notification, 'id' | 'read'>[] = [
    { title: 'New Feature: Post Summaries', description: 'We\'ve added AI-powered summaries to our posts!', createdAt: '2024-07-28T12:00:00Z' },
    { title: 'Welcome to the new Nova!', description: 'Our new website is live. We hope you enjoy the new design and features.', createdAt: '2024-07-27T09:00:00Z' },
];


export const initialBulletinsData: Omit<Bulletin, 'id'>[] = [
    {
        title: 'Daily Market Wrap-Up',
        content: 'Markets closed mixed today after a volatile session. The tech sector saw modest gains, while energy stocks lagged behind. Investors are eagerly awaiting tomorrow\'s inflation report.',
        coverImage: 'https://picsum.photos/1200/800?random=6',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
        title: 'New AI Breakthrough Announced',
        content: 'A leading research lab has unveiled a new generative AI model capable of creating realistic video from simple text prompts, marking a significant leap forward in creative technology.',
        coverImage: 'https://picsum.photos/1200/800?random=7',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        title: 'Global Climate Summit Concludes',
        content: 'The international climate summit ended today with a landmark agreement to accelerate the transition to renewable energy sources. Several nations have pledged to double their efforts in reducing carbon emissions by 2030.',
        coverImage: 'https://picsum.photos/1200/800?random=8',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
        title: 'Space Agency Plans Lunar Mission',
        content: 'The national space agency announced its most ambitious project yet: a plan to establish a permanent human outpost on the moon. The first launch is scheduled for early next year.',
        coverImage: 'https://picsum.photos/1200/800?random=9',
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    },
     {
        title: 'Advances in Medical Research',
        content: 'Researchers have identified a new protein that could be key to developing more effective treatments for autoimmune diseases. Early trials have shown promising results.',
        coverImage: 'https://picsum.photos/1200/800?random=10',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
];

export const initialDiaryEntriesData: Omit<DiaryEntry, 'id'>[] = [
  {
    chapter: 1,
    title: 'The Quiet Beginning',
    date: 'July 2024',
    icon: 'https://i.ibb.co/VvzVbV3/feather.png',
    content: "<h3>The First Page</h3><p>Every story has a beginning, but not all are marked by a grand declaration. Some start with a silent promise, a quiet turn of a page in a new, empty book. This is one such beginning. A space carved out of the digital noise, a sanctuary for thoughts that are too fragile for the open air. It's a promise to myself to listen more closely to the whispers of my own heart.</p>",
  },
  {
    chapter: 2,
    title: 'Seeds of Change',
    date: 'August 2024',
    icon: 'https://i.ibb.co/C0t3fM6/sprout.png',
    content: "<h3>Planting an Idea</h3><p>Today, I planted a small seed, both in a pot on my windowsill and in the fertile soil of my mind. The seed of a new idea, a new direction. It feels small and uncertain, yet it holds the blueprint for a forest. I find myself watering it with quiet curiosity and a strange, unearned hope. There's a profound beauty in nurturing potential, in believing in growth even when the first shoot has yet to break the surface.</p>",
  },
  {
    chapter: 3,
    title: 'Whispers of the Night Sky',
    date: 'September 2024',
    icon: 'https://i.ibb.co/YcmkL1g/moon.png',
    content: "<h3>A Silent Confidante</h3><p>The world outside sleeps, but my mind is a bustling city of thoughts. The night has a unique way of stripping away the day's noise, leaving only the essential truths. It's in these quiet, ink-black hours that I confront my deepest fears and my most audacious dreams. The moon, my silent confidante, listens without judgment, its pale light a comforting presence. This is a time for reflection, for untangling the 'why' from the 'what'.</p>",
  },
];

export const simulatedAiNews = [
  { title: "Breakthrough in Fusion Energy", content: "Scientists have achieved a net energy gain in a fusion reaction for the second time, paving the way for a future of clean, limitless power.", imageKeywords: "fusion reactor" },
  { title: "AI Detects Cancer Earlier", content: "A new AI model can detect lung cancer from scans with 90% accuracy, promising to save lives through early diagnosis and treatment.", imageKeywords: "medical scan" },
  { title: "First Commercial Asteroid Mine", content: "A private company has launched its first mission to mine a near-earth asteroid for precious metals, heralding a new space-based economy.", imageKeywords: "asteroid mining" },
  { title: "Global Carbon Emissions Drop", content: "For the first time in a decade, global carbon emissions have fallen, thanks to a rapid expansion of renewable energy sources worldwide.", imageKeywords: "wind turbines" },
  { title: "Quantum Computing Milestone", content: "Researchers have built the first stable, 100-qubit quantum computer, a major step towards solving problems beyond the reach of classical computers.", imageKeywords: "quantum computer" },
  { title: "Vertical Farms Feed Megacities", content: "Large-scale vertical farms are now producing tons of fresh produce in the heart of major cities, reducing food miles and increasing food security.", imageKeywords: "vertical farm" },
  { title: "Lab-Grown Meat Hits Shelves", content: "Cultivated meat, grown from animal cells without slaughter, is now available in select supermarkets, offering an ethical and sustainable protein alternative.", imageKeywords: "modern food" },
  { title: "New Deep-Sea Species Discovered", content: "An oceanographic expedition has discovered over 100 new species in the Clarion-Clipperton Zone, highlighting the vast biodiversity of our planet's oceans.", imageKeywords: "deep sea" },
];
