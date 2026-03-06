'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HardHat, Briefcase, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    return (
        <>
            <Navbar />
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6rem 1.5rem 4rem',
                background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)',
            }}>
                <div style={{ maxWidth: '600px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>
                            Join NeedLabour
                        </h1>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                            Choose how you want to use the platform
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1.25rem',
                    }}>
                        {/* Worker Card */}
                        <Link href="/register/worker" style={{ textDecoration: 'none' }}>
                            <div className="card" style={{
                                padding: '2rem 1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: '2px solid var(--border)',
                            }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-400)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                            >
                                <div style={{
                                    width: '4rem',
                                    height: '4rem',
                                    borderRadius: 'var(--radius-xl)',
                                    background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.25rem',
                                }}>
                                    <HardHat size={28} color="var(--primary-600)" />
                                </div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                                    I&apos;m a Worker
                                </h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                                    Register your skills and get hired for construction projects in Jammu
                                </p>
                                <span className="btn btn-primary" style={{ width: '100%' }}>
                                    Register as Worker
                                    <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>

                        {/* Customer Card */}
                        <Link href="/register/customer" style={{ textDecoration: 'none' }}>
                            <div className="card" style={{
                                padding: '2rem 1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: '2px solid var(--border)',
                            }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--secondary-400)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                            >
                                <div style={{
                                    width: '4rem',
                                    height: '4rem',
                                    borderRadius: 'var(--radius-xl)',
                                    background: 'linear-gradient(135deg, var(--secondary-100), var(--secondary-200))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.25rem',
                                }}>
                                    <Briefcase size={28} color="var(--secondary-600)" />
                                </div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
                                    I Need Workers
                                </h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                                    Post your requirements and hire skilled workers for your construction projects
                                </p>
                                <span className="btn btn-secondary" style={{ width: '100%' }}>
                                    Register as Customer
                                    <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    </div>

                    <p style={{
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        color: 'var(--gray-500)',
                        marginTop: '2rem',
                    }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
}
