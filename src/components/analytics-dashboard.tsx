
'use client';

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Post, Comment, getComments } from '@/lib/data';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useMemo, useEffect } from 'react';
import { subDays, subHours, format, parseISO } from 'date-fns';

interface AnalyticsDashboardProps {
  posts: Post[];
}

interface PostAnalytic extends Post {
    views: number;
    impressions: number;
    commentsCount: number;
}

const generateChartData = (posts: PostAnalytic[], timeRange: string) => {
  const data: { [key: string]: { name: string, views: number, likes: number, date: Date } } = {};
  
  const initializeDataPoint = (name: string, date: Date) => ({ name, views: 0, likes: 0, date });

  if (timeRange === '1') { // Last 24 hours
    const startDate = subHours(new Date(), 23);
    for (let i = 0; i < 24; i++) {
      const date = subHours(new Date(), i);
      const formattedDate = format(date, 'ha');
      if (!data[formattedDate]) {
        data[formattedDate] = initializeDataPoint(formattedDate, date);
      }
    }
    posts.forEach(post => {
      const postDate = parseISO(post.publishedAt);
      if (postDate >= startDate) {
        const formattedDate = format(postDate, 'ha');
        if (data[formattedDate]) {
          data[formattedDate].views += post.views;
          data[formattedDate].likes += (post.likes || 0);
        }
      }
    });
    return Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());
  } else { // Days view
    const days = Number(timeRange);
    const startDate = subDays(new Date(), days - 1);
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, 'MMM d');
      data[formattedDate] = initializeDataPoint(formattedDate, date);
    }
    posts.forEach(post => {
      const postDate = parseISO(post.publishedAt);
      if (postDate >= startDate) {
        const formattedDate = format(postDate, 'MMM d');
        if (data[formattedDate]) {
          data[formattedDate].views += post.views;
          data[formattedDate].likes += (post.likes || 0);
        }
      }
    });
    return Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
};


const AnalyticsDashboard = ({ posts }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState('30');
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processAnalytics = async () => {
        setLoading(true);
        const analyticsData = posts.map(post => {
            return {
            ...post,
            views: (post.likes || 0) * 5, // Simple estimation: 1 like = 5 views
            impressions: (post.likes || 0) * 10, // Simple estimation: 1 like = 10 impressions
            commentsCount: 0, // Will be fetched, but initialize
            };
        });

        // Fetch comments in parallel
        const commentPromises = analyticsData.map(post => getComments(post.id));
        const commentsPerPost = await Promise.all(commentPromises);
        
        analyticsData.forEach((post, index) => {
            post.commentsCount = commentsPerPost[index].length;
        });
        
        setPostAnalytics(analyticsData.sort((a,b) => b.views - a.views));
        setLoading(false);
    }
    processAnalytics();
  }, [posts]);
  
  const chartData = useMemo(() => generateChartData(postAnalytics, timeRange), [postAnalytics, timeRange]);
  
  const totalLikes = postAnalytics.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalViews = postAnalytics.reduce((sum, post) => sum + post.views, 0);
  const totalImpressions = postAnalytics.reduce((sum, post) => sum + post.impressions, 0);
  const totalComments = postAnalytics.reduce((sum, post) => sum + post.commentsCount, 0);


  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

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
                <CardDescription>A summary of your content's engagement over time.</CardDescription>
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
                <Line type="monotone" dataKey="views" name="Pageviews (Est.)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="likes" name="Likes" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 2, fill: "hsl(var(--destructive))" }} activeDot={{ r: 6 }} />
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
