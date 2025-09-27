
import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map(({ slug, publishedAt }) => ({
    url: `https://theglare.vercel.app/posts/${slug}`,
    lastModified: publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  const staticPages: MetadataRoute.Sitemap = [
    {
<<<<<<< HEAD
      url: `https://theglare.vercel.app/`,
=======
      url: 'https://theglare.vercel.app/',
>>>>>>> da6367b9eb324990e455230d2ee2a4bcba7891e1
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
<<<<<<< HEAD
      url: `https://theglare.vercel.app/posts`,
=======
      url: 'https://theglare.vercel.app/posts',
>>>>>>> da6367b9eb324990e455230d2ee2a4bcba7891e1
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
<<<<<<< HEAD
      url: `https://theglare.vercel.app/about`,
=======
      url: 'https://theglare.vercel.app/about',
>>>>>>> da6367b9eb324990e455230d2ee2a4bcba7891e1
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
<<<<<<< HEAD
     {
      url: `https://theglare.vercel.app/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `https://theglare.vercel.app/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `https://theglare.vercel.app/newsletter`,
=======
    {
      url: 'https://theglare.vercel.app/newsletter',
>>>>>>> da6367b9eb324990e455230d2ee2a4bcba7891e1
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
<<<<<<< HEAD
    {
      url: `https://theglare.vercel.app/bulletin`,
=======
     {
      url: 'https://theglare.vercel.app/contact',
>>>>>>> da6367b9eb324990e455230d2ee2a4bcba7891e1
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://theglare.vercel.app/privacy-policy',
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  return [
    ...staticPages,
    ...postEntries,
  ];
}
