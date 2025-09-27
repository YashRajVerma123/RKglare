import { NextResponse } from 'next/server';

const SITE_URL = 'https://theglare.netlify.app';

export async function GET() {
  const posts = [
    { slug: 'first-post', updatedAt: '2025-09-27T08:26:01.995Z' },
    { slug: 'second-post', updatedAt: '2025-09-26T10:00:00.000Z' },
    // Add your real posts here, or fetch from CMS
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/posts</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${posts.map(
    ({ slug, updatedAt }) => `
  <url>
    <loc>${SITE_URL}/posts/${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('')}
</urlset>`;

  return new NextResponse(sitemap, { headers: { 'Content-Type': 'application/xml' } });
}
