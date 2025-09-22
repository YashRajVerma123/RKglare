
'use client';

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/lib/data';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useMemo, useEffect } from 'react';
import { subDays, subHours, format, parseISO } from 'date-fns';
import { getComments } from '@/lib/data';

interface AnalyticsDashboardProps {
  posts: Post[];
}

const generateChartData = (posts: Post[], timeRange: string) => {
  const data: { [key: string]: { name: string, views: number, date: Date } } = {};
  const endDate = new Date();
  const impressionsPerLike = 5; // Each like is estimated to represent 5 views/impressions

  if (timeRange === '1') { // Last 24 hours
    const startDate = subHours(endDate, 23);
    for (let i = 0; i < 24; i++) {
      const date = subHours(endDate, i);
      const formattedDate = format(date, 'ha'); // '12am', '1pm', etc.
      if (!data[formattedDate]) {
        data[formattedDate] = { name: formattedDate, views: 0, date };
      }
    }
    posts.forEach(post => {
      const postDate = parseISO(post.publishedAt);
      if (postDate >= startDate && postDate <= endDate) {
        const formattedDate = format(postDate, 'ha');
        if (data[formattedDate]) {
          data[formattedDate].views += (post.likes || 0) * impressionsPerLike;
        }
      }
    });
     return Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());
  } else { // Days view
    const days = Number(timeRange);
    const startDate = subDays(endDate, days - 1);
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const formattedDate = format(date, 'MMM d');
      data[formattedDate] = { name: formattedDate, views: 0, date };
    }
    posts.forEach(post => {
      const postDate = parseISO(post.publishedAt);
      if (postDate >= startDate && postDate <= endDate) {
        const formattedDate = format(postDate, 'MMM d');
        if (data[formattedDate]) {
          data[formattedDate].views += (post.likes || 0) * impressionsPerLike;
        }
      }
    });
    return Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
};


const AnalyticsDashboard = ({ posts }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState('30');
  const [postAnalytics, setPostAnalytics] = useState<any[]>([]);
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      let totalCommentsCount = 0;
      const analyticsPromises = posts.map(async post => {
        const comments = await getComments(post.id);
        totalCommentsCount += comments.length;
        return {
          ...post,
          views: (post.likes || 0) * 5, // Simple estimation: 1 like = 5 views
          impressions: (post.likes || 0) * 10, // Simple estimation: 1 like = 10 impressions
          commentsCount: comments.length,
        };
      });
      const resolvedAnalytics = await Promise.all(analyticsPromises);
      setPostAnalytics(resolvedAnalytics.sort((a,b) => b.views - a.views));
      setTotalComments(totalCommentsCount);
    }
    fetchAnalytics();
  }, [posts]);
  
  const chartData = useMemo(() => generateChartData(posts, timeRange), [posts, timeRange]);
  
  const totalLikes = postAnalytics.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalViews = postAnalytics.reduce((sum, post) => sum + post.views, 0);
  const totalImpressions = postAnalytics.reduce((sum, post) => sum + post.impressions, 0);


  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pageviews (Est.)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated based on likes.</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all posts.</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all posts.</p>
          </CardContent>
        </Card>
         <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions (Est.)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated based on likes.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Audience Overview</CardTitle>
                <CardDescription>A summary of your content's estimated pageviews over time.</CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)"/>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--background) / 0.8)",
                        borderColor: "hsl(var(--border))",
                        backdropFilter: 'blur(4px)',
                    }}
                 />
                <Legend iconType="circle"/>
                <Line type="monotone" dataKey="views" name="Pageviews (Est.)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Your most engaging articles based on likes and comments.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Post</TableHead>
                        <TableHead className="text-right">Likes</TableHead>
                        <TableHead className="text-right">Comments</TableHead>
                        <TableHead className="text-right">Pageviews (Est.)</TableHead>
                        <TableHead className="text-right">Read Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {postAnalytics.slice(0, 5).map(post => (
                       <TableRow key={post.id}>
                           <TableCell>
                               <Link href={`/posts/${post.slug}`} className="font-medium hover:underline" target="_blank">
                                {post.title}
                               </Link>
                           </TableCell>
                           <TableCell className="text-right">{(post.likes || 0).toLocaleString()}</TableCell>
                           <TableCell className="text-right">{post.commentsCount.toLocaleString()}</TableCell>
                           <TableCell className="text-right">{post.views.toLocaleString()}</TableCell>
                           <TableCell className="text-right text-primary font-semibold">{post.readTime} min</TableCell>
                       </TableRow>
                   ))}
                </TableBody>
             </Table>
          </CardContent>
      </Card>

    </div>
  );
};

export default AnalyticsDashboard;
