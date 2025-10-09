
import { notFound } from 'next/navigation';
import { Post, getPost, getRelatedPosts, getComments, Comment as CommentType, Author } from '@/lib/data';
import PostActions from '@/components/post-actions';
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import BlogPostCard from '@/components/blog-post-card';
import CommentSection from '@/components/comment-section';
import AboutTheAuthor from '@/components/about-the-author';
import PostClientPage from './post-client-page';

interface PostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


export async function generateMetadata({ params }: PostPageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const siteUrl = 'https://theglare.vercel.app';
  const fullUrl = `${siteUrl}/posts/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags.join(', '),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: fullUrl,
      siteName: 'Glare',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.coverImage],
      creator: '@yashrajverma', // Assuming a general site twitter handle
    },
  }
}


export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }
  
  const [relatedPosts, initialComments] = await Promise.all([
    getRelatedPosts(post),
    getComments(post.id)
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://theglare.vercel.app/posts/${post.slug}`,
    },
    publisher: {
        '@type': 'Organization',
        name: 'Glare',
        logo: {
            '@type': 'ImageObject',
            url: 'https://theglare.vercel.app/logo.png',
        },
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Math.max(5 * ( (post.likes || 0) / 100), 3.5).toFixed(1),
        reviewCount: (post.likes || 0) + initialComments.length,
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostClientPage
        post={post}
        relatedPosts={relatedPosts}
        initialComments={initialComments}
      />
    </>
  );
};
