'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Menu, X, HardHat, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { userData, signOut, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const getDashboardLink = () => {
        if (!userData) return '/login';
        switch (userData.role) {
            case 'ADMIN': return '/admin';
            case 'WORKER': return '/dashboard/worker';
            case 'CUSTOMER': return '/dashboard/customer';
            default: return '/login';
        }
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '64px',
            }}>
                {/* Brand */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <HardHat size={20} color="white" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--foreground)' }}>
                        Need<span style={{ color: 'var(--primary-500)' }}>Labour</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
                    <Link href="/#how-it-works" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                        How It Works
                    </Link>
                    {!loading && (
                        <>
                            {userData ? (
                                <>
                                    <Link href={getDashboardLink()} className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                                        <LayoutDashboard size={16} />
                                        Dashboard
                                    </Link>
                                    <button onClick={signOut} className="btn btn-outline btn-sm">
                                        <LogOut size={14} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                                        Log In
                                    </Link>
                                    <Link href="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="btn btn-icon btn-ghost mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{ display: 'none' }}
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border)',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}>
                    <Link href="/#how-it-works" className="btn btn-ghost" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'flex-start', textDecoration: 'none' }}>
                        How It Works
                    </Link>
                    {userData ? (
                        <>
                            <Link href={getDashboardLink()} className="btn btn-ghost" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'flex-start', textDecoration: 'none' }}>
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                            <button onClick={() => { signOut(); setMobileOpen(false); }} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                <LogOut size={14} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'flex-start', textDecoration: 'none' }}>
                                Log In
                            </Link>
                            <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            )}

            <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
        </nav>
    );
}
