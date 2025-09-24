
import { getPosts, getNotifications, getBulletins } from "@/lib/data";
import AdminClientPage from "./admin-client";

// This is now a Server Component
export default async function AdminPage() {
    // Fetch only data needed for the initial view (analytics) to keep the payload small.
    // We pass `false` to explicitly exclude the heavy 'content' field.
    const posts = await getPosts(false);
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
