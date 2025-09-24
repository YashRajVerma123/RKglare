
import { getPosts, getNotifications, getBulletins } from "@/lib/data";
import AdminClientPage from "./admin-client";

const AdminPage = async () => {
    // Fetch all data on the server, but get lightweight posts
    const postsData = getPosts(false);
    const notificationsData = getNotifications();
    const bulletinsData = getBulletins(100);

    const [posts, notifications, bulletinsResponse] = await Promise.all([
        postsData,
        notificationsData,
        bulletinsData
    ]);

    const sortedPosts = posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return (
        <AdminClientPage
            initialPosts={sortedPosts}
            initialNotifications={notifications}
            initialBulletins={bulletinsResponse.bulletins}
        />
    );
};

export default AdminPage;
    
