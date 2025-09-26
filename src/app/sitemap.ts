
import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const baseUrl = 'https://theglare.netlify.app';

  const postEntries: MetadataRoute.Sitemap = posts.map(({ slug, publishedAt }) => ({
    url: `${baseUrl}/posts/${slug}`,
    lastModified: publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
     {
      url: `${baseUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bulletin`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  return [
    ...staticPages,
    ...postEntries,
  ];
}
