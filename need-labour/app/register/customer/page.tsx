'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { User, Phone, Mail, Lock, Building2, AlertCircle, ArrowRight } from 'lucide-react';

export default function CustomerRegisterPage() {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        company: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await signUp(form.email, form.password, {
                name: form.name,
                email: form.email,
                phone: form.phone,
                role: 'CUSTOMER',
            });
            router.push('/dashboard/customer');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters');
            } else {
                setError('Registration failed. Please try again.');
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
                background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--secondary-50) 100%)',
            }}>
                <div style={{ maxWidth: '460px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>
                            Register as a Customer
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            Start hiring skilled construction workers
                        </p>
                    </div>

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
                                <label className="input-label">Full Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type="text" className="input-field input-field-with-icon" placeholder="Your full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Phone Number *</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type="tel" className="input-field input-field-with-icon" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Email Address *</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type="email" className="input-field input-field-with-icon" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Company / Organization (optional)</label>
                                <div style={{ position: 'relative' }}>
                                    <Building2 size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type="text" className="input-field input-field-with-icon" placeholder="Your company name" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="password" className="input-field input-field-with-icon" placeholder="Min 6 chars" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Confirm Password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="password" className="input-field input-field-with-icon" placeholder="Re-enter" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-secondary btn-lg" disabled={loading} style={{ width: '100%' }}>
                                {loading ? (
                                    <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
                                ) : (
                                    <>
                                        Create Customer Account
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p style={{
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        color: 'var(--gray-500)',
                        marginTop: '1.5rem',
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
