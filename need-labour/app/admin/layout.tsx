'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, ClipboardList, Users, CreditCard, LogOut, HardHat, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/requests', label: 'Job Requests', icon: ClipboardList },
    { href: '/admin/workers', label: 'Workers', icon: Users },
    { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { userData, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && (!userData || userData.role !== 'ADMIN')) {
            router.push('/login');
        }
    }, [userData, loading]);

    if (loading) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    if (!userData || userData.role !== 'ADMIN') return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile Header */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '56px',
                background: 'var(--secondary-900)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                zIndex: 45,
            }} className="admin-mobile-header">
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <HardHat size={20} color="var(--primary-400)" />
                    <span style={{ fontWeight: 800, color: 'white', fontSize: '0.9375rem' }}>
                        Need<span style={{ color: 'var(--primary-400)' }}>Labour</span>
                    </span>
                </Link>
                <button className="btn btn-icon btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'white' }}>
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 39,
                }} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <Link href="/" className="sidebar-brand" style={{ textDecoration: 'none' }}>
                    <h2>
                        <HardHat size={20} style={{ display: 'inline', marginRight: '0.375rem' }} />
                        NeedLabour
                    </h2>
                    <p>Admin Dashboard</p>
                </Link>

                <div className="sidebar-section">Navigation</div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>
                        <div style={{ color: 'white', fontWeight: 600 }}>{userData.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Admin</div>
                    </div>
                    <button className="sidebar-link" onClick={signOut} style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none' }}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-with-sidebar">
                {children}
            </main>

            <style jsx>{`
        @media (max-width: 768px) {
          .admin-mobile-header { display: flex !important; }
        }
      `}</style>
        </div>
    );
}
