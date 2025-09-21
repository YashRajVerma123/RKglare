
'use client';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Notification, getNotifications } from '@/lib/data';
import { Separator } from './ui/separator';

const NOTIFICATION_READ_STATE_KEY = 'read_notifications';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAndSetNotifications = async () => {
    setLoading(true);
    try {
      const currentNotifications = await getNotifications();
      const readIds = JSON.parse(localStorage.getItem(NOTIFICATION_READ_STATE_KEY) || '[]');
      
      const updatedNotifications = currentNotifications.map(n => ({
        ...n,
        read: readIds.includes(n.id),
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetNotifications();
  }, []);

  // This effect runs when the popover is opened, ensuring we always have the freshest data.
  useEffect(() => {
    if (isOpen) {
      fetchAndSetNotifications();
    }
  }, [isOpen]); 

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(NOTIFICATION_READ_STATE_KEY, JSON.stringify(allIds));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markOneAsRead = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem(NOTIFICATION_READ_STATE_KEY) || '[]');
    if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem(NOTIFICATION_READ_STATE_KEY, JSON.stringify(readIds));
    }
    // Update state locally to give immediate feedback
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex justify-between items-center p-4">
            <div>
                <h4 className="font-medium leading-none">Notifications</h4>
                <p className="text-sm text-muted-foreground">You have {unreadCount} unread messages.</p>
            </div>
             {unreadCount > 0 && (
                <Button variant="link" size="sm" onClick={markAllAsRead} className="text-xs">
                    Mark all as read
                </Button>
            )}
        </div>
        <Separator />
        <div className="p-2 max-h-80 overflow-y-auto">
          {loading ? (
             <div className="text-center p-4 text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className={`mb-1 p-2 rounded-lg cursor-pointer hover:bg-secondary/50`} onClick={() => markOneAsRead(notification.id)}>
                <div className="grid grid-cols-[25px_1fr] items-start">
                    {!notification.read && <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />}
                    {notification.read && <span/>}
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                       {notification.image && (
                          <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                              <img src={notification.image} alt={notification.title} className="object-cover w-full h-full" />
                          </div>
                      )}
                      <p className="text-xs text-muted-foreground/70 pt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">No new notifications.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
