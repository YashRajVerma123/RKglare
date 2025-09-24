

import { notFound } from 'next/navigation';
import { Post, getPost, getRelatedPosts, getComments, Comment as CommentType } from '@/lib/data';
import PostActions from '@/components/post-actions';
import type { Metadata } from 'next';
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


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `https://theglare.netlify.app/posts/${post.slug}`,
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
    },
  }
}


export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

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
        '@id': `https://theglare.netlify.app/posts/${post.slug}`,
    },
    publisher: {
        '@type': 'Organization',
        name: 'Glare',
        logo: {
            '@type': 'ImageObject',
            url: 'https://theglare.netlify.app/logo.png',
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
