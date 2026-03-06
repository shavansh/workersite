'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Lock, ArrowRight, HardHat, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, userData } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            // Redirect will happen once userData loads, but let's also redirect here
            // We need to wait briefly for userData to populate
            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 500);
        } catch (err: any) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

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
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-xl)',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}>
                            <HardHat size={24} color="white" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>
                            Welcome Back
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            Sign in to your NeedLabour account
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.8125rem',
                                    marginBottom: '1.25rem',
                                    fontWeight: 500,
                                }}>
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{
                                        position: 'absolute',
                                        left: '0.875rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--gray-400)',
                                    }} />
                                    <input
                                        type="email"
                                        className="input-field input-field-with-icon"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{
                                        position: 'absolute',
                                        left: '0.875rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--gray-400)',
                                    }} />
                                    <input
                                        type="password"
                                        className="input-field input-field-with-icon"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                {loading ? (
                                    <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer Text */}
                    <p style={{
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        color: 'var(--gray-500)',
                        marginTop: '1.5rem',
                    }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
}
