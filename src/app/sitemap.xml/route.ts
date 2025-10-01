import { getPosts } from '@/lib/data';
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theglare.vercel.app';

export async function GET() {
  const posts = await getPosts(false); // Fetch lightweight posts

  const postEntries = posts.map(({ slug, publishedAt }) => ({
    url: `${SITE_URL}/posts/${slug}`,
    lastModified: new Date(publishedAt).toISOString(),
  }));

  const staticPages = [
    { url: `${SITE_URL}/`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/posts`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/bulletin`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/leaderboard`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/bookmarks`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/glare-plus`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/points-system`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/about`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/contact`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/newsletter`, lastModified: new Date().toISOString() },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date().toISOString() },
  ];

  const allEntries = [...staticPages, ...postEntries];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allEntries
    .map((entry) => {
      return `
    <url>
      <loc>${entry.url}</loc>
      <lastmod>${entry.lastModified}</lastmod>
    </url>
  `;
    })
    .join('')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
