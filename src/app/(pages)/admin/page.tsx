
import { getPosts, getNotifications, getBulletins, getAuthors } from "@/lib/data";
import AdminClientPage from "./admin-client";

const AdminPage = async () => {
    // Fetch all data on the server, but get lightweight posts
    const postsData = getPosts(false);
    const notificationsData = getNotifications();
    const bulletinsData = getBulletins(undefined, 100);
    const usersData = getAuthors();

    const [posts, notifications, bulletinsResponse, users] = await Promise.all([
        postsData,
        notificationsData,
        bulletinsData,
        usersData,
    ]);

    const sortedPosts = posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return (
        <AdminClientPage
            initialPosts={sortedPosts}
            initialNotifications={notifications}
            initialBulletins={bulletinsResponse.bulletins}
            initialUsers={users}
        />
    );
};

export default AdminPage;
