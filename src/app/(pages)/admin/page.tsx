

import AdminClientPage from "./admin-client";

// This is now a Server Component that passes no data.
// All data fetching is handled on the client to avoid Next.js data cache limits.
export default async function AdminPage() {
    return (
        <AdminClientPage
            initialPosts={[]}
            initialNotifications={[]}
            initialBulletins={[]}
        />
    );
}
