// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map(({ slug, publishedAt }) => ({
<<<<<<< HEAD:src/app/sitemap.xml.ts
    url: `/posts/${slug}`,
=======
    url: `https://theglare.vercel.app/posts/${slug}`,
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
    lastModified: publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  const staticPages: MetadataRoute.Sitemap = [
    {
<<<<<<< HEAD:src/app/sitemap.xml.ts
      url: `/`,
=======
      url: 'https://theglare.vercel.app/',
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
<<<<<<< HEAD:src/app/sitemap.xml.ts
      url: `/posts`,
=======
      url: 'https://theglare.vercel.app/posts',
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
     {
      url: 'https://theglare.vercel.app/bulletin',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
<<<<<<< HEAD:src/app/sitemap.xml.ts
      url: `/about`,
=======
      url: 'https://theglare.vercel.app/about',
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
<<<<<<< HEAD:src/app/sitemap.xml.ts
     {
      url: `/contact`,
=======
    {
      url: 'https://theglare.vercel.app/contact',
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
<<<<<<< HEAD:src/app/sitemap.xml.ts
      url: `/privacy-policy`,
=======
      url: 'https://theglare.vercel.app/privacy-policy',
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
<<<<<<< HEAD:src/app/sitemap.xml.ts
      url: `/newsletter`,
=======
      url: 'https://theglare.vercel.app/newsletter',
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
<<<<<<< HEAD:src/app/sitemap.xml.ts
    {
      url: `/bulletin`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
=======
>>>>>>> e7844f2535fbec6a2f8b8bf5ad53f40eb1b103f7:src/app/sitemap.ts
  ];

  return [
    ...staticPages,
    ...postEntries,
  ];
}
