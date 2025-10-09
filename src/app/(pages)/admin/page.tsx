

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

    // Ensure all data is serializable before passing to the client component
    const serializablePosts = posts.map(post => ({
        ...post,
        publishedAt: new Date(post.publishedAt).toISOString(),
        trendingUntil: post.trendingUntil ? new Date(post.trendingUntil).toISOString() : null,
    })).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const serializableUsers = users.map(user => ({
        ...user,
        premium: user.premium ? {
            ...user.premium,
            expires: user.premium.expires ? new Date(user.premium.expires).toISOString() : null,
        } : { active: false, expires: null },
        streak: user.streak ? {
            ...user.streak,
            lastLoginDate: user.streak.lastLoginDate ? new Date(user.streak.lastLoginDate).toISOString() : '',
        } : undefined,
        challenge: user.challenge ? {
            ...user.challenge,
            assignedAt: user.challenge.assignedAt ? new Date(user.challenge.assignedAt).toISOString() : '',
        } : undefined,
    }));
    
    const serializableNotifications = notifications.map(n => ({
        ...n,
        createdAt: new Date(n.createdAt).toISOString(),
    }));

    const serializableBulletins = bulletinsResponse.bulletins.map(b => ({
        ...b,
        publishedAt: new Date(b.publishedAt).toISOString(),
    }));


    return (
        <AdminClientPage
            initialPosts={serializablePosts}
            initialNotifications={serializableNotifications}
            initialBulletins={serializableBulletins}
            initialUsers={serializableUsers}
            initialDiaryEntries={diaryEntries}
        />
    );
};

export default AdminPage;
