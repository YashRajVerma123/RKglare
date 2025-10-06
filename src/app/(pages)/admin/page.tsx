

import { getPosts, getNotifications, getBulletins, getAuthors, getDiaryEntries } from "@/lib/data";
import AdminClientPage from "./admin-client";

const AdminPage = async () => {
    // Fetch all data on the server, but get lightweight posts
    const postsData = getPosts(false);
    const notificationsData = getNotifications();
    const bulletinsData = getBulletins(); // Fetch all bulletins
    const usersData = getAuthors();
    const diaryData = getDiaryEntries();

    const [posts, notifications, bulletinsResponse, users, diaryEntries] = await Promise.all([
        postsData,
        notificationsData,
        bulletinsData,
        usersData,
        diaryData
    ]);

    const sortedPosts = posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return (
        <AdminClientPage
            initialPosts={sortedPosts}
            initialNotifications={notifications}
            initialBulletins={bulletinsResponse.bulletins}
            initialUsers={users}
            initialDiaryEntries={diaryEntries}
        />
    );
};

export default AdminPage;
