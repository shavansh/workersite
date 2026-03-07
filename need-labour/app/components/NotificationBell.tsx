'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Notification } from '@/lib/types';
import { markAsRead, markAllAsRead } from '@/lib/notifications';
import { Bell, CheckCheck, Briefcase, CreditCard, Info, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const typeIcons: Record<string, typeof Briefcase> = {
    ASSIGNMENT: Briefcase,
    STATUS_UPDATE: Info,
    PAYMENT: CreditCard,
    GENERAL: AlertCircle,
};

const typeColors: Record<string, string> = {
    ASSIGNMENT: '#2563eb',
    STATUS_UPDATE: '#f97316',
    PAYMENT: '#22c55e',
    GENERAL: '#71717a',
};

export default function NotificationBell() {
    const { userData } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!userData) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userData.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date(),
            })) as Notification[];
            setNotifications(data);
        });

        return () => unsub();
    }, [userData]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleClick = async (notif: Notification) => {
        if (!notif.read && notif.id) {
            await markAsRead(notif.id);
        }
        if (notif.link) {
            router.push(notif.link);
        }
        setOpen(false);
    };

    const handleMarkAll = async () => {
        if (!userData) return;
        await markAllAsRead(userData.uid);
    };

    const timeAgo = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (!userData) return null;

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                }}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '1.125rem',
                        height: '1.125rem',
                        borderRadius: '50%',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '340px',
                    maxHeight: '420px',
                    background: 'white',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    zIndex: 100,
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border)',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAll}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    color: 'var(--primary-600)',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}
                            >
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '360px', overflow: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.8125rem' }}>
                                <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const IconComp = typeIcons[n.type] || AlertCircle;
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleClick(n)}
                                        style={{
                                            display: 'flex',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--gray-100)',
                                            background: n.read ? 'transparent' : 'var(--primary-50)',
                                            transition: 'background 0.15s ease',
                                        }}
                                    >
                                        <div style={{
                                            width: '2rem',
                                            height: '2rem',
                                            borderRadius: '50%',
                                            background: `${typeColors[n.type]}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <IconComp size={14} color={typeColors[n.type]} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.8125rem', lineHeight: 1.3 }}>
                                                    {n.title}
                                                </span>
                                                {!n.read && (
                                                    <span style={{
                                                        width: '0.5rem',
                                                        height: '0.5rem',
                                                        borderRadius: '50%',
                                                        background: 'var(--primary-500)',
                                                        flexShrink: 0,
                                                        marginTop: '0.25rem',
                                                    }} />
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: '0.125rem 0 0', lineHeight: 1.4 }}>
                                                {n.message}
                                            </p>
                                            <span style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
