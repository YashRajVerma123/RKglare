
import { getPosts, getNotifications, getBulletins } from "@/lib/data";
import AdminClientPage from "./admin-client";

// This is now a Server Component
export default async function AdminPage() {
    // Fetch all data on the server. This is more efficient and reliable.
    const posts = await getPosts();
    const sortedPosts = posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    const notifications = await getNotifications();
    const bulletinsResponse = await getBulletins(100); // Fetch all bulletins

    return (
        <AdminClientPage
            initialPosts={sortedPosts}
            initialNotifications={notifications}
            initialBulletins={bulletinsResponse.bulletins}
        />
    );
}
