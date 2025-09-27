import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';

const SITE_URL = 'https://theglare.vercel.app'; // replace with your real domain

export async function GET() {
  const posts = await getAllPosts(); // Fetch all posts dynamically

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
  ${posts
    .map(
      ({ slug, updatedAt }) => `
  <url>
    <loc>${SITE_URL}/posts/${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml', // THIS IS CRUCIAL
    },
  });
}
