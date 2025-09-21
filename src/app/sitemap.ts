import { MetadataRoute } from 'next'
import { getPosts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map(({ slug, publishedAt }) => ({
    url: `https://theglare.netlify.app/posts/${slug}`,
    lastModified: publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `https://theglare.netlify.app/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `https://theglare.netlify.app/posts`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `https://theglare.netlify.app/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
     {
      url: `https://theglare.netlify.app/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `https://theglare.netlify.app/bulletin`,
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
