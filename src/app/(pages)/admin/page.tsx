

import { getPosts, getNotifications, getBulletins, getAuthorsClient, getDiaryEntries, Author } from "@/lib/data";
import AdminClientPage from "./admin-client";

const AdminPage = async () => {
    // Fetch all data on the server, but get lightweight posts
    const postsData = getPosts(false);
    const notificationsData = getNotifications();
    const bulletinsData = getBulletins(); // Fetch all bulletins
    const usersData = getAuthorsClient();
    const diaryData = getDiaryEntries();

    const [posts, notifications, bulletinsResponse, users, diaryEntries] = await Promise.all([
        postsData,
        notificationsData,
        bulletinsData,
        usersData,
        diaryData
    ]);

    const sortedPosts = posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Ensure all user data is serializable before passing to the client component
    const serializableUsers = users.map(user => ({
        ...user,
        premium: user.premium ? {
            ...user.premium,
            expires: user.premium.expires ? new Date(user.premium.expires).toISOString() : null,
        } : undefined,
    }));


    return (
        <AdminClientPage
            initialPosts={sortedPosts}
            initialNotifications={notifications}
            initialBulletins={bulletinsResponse.bulletins}
            initialUsers={serializableUsers}
            initialDiaryEntries={diaryEntries}
        />
    );
};

export default AdminPage;
