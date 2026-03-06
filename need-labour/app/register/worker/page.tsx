'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SKILLS, LANGUAGES, LOCATIONS } from '@/lib/types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { User, Phone, Mail, Lock, MapPin, Briefcase, AlertCircle, ArrowRight, IndianRupee } from 'lucide-react';

export default function WorkerRegisterPage() {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        skills: [] as string[],
        experience: '',
        dailyWage: '',
        location: '',
        languages: [] as string[],
        bio: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const toggleItem = (field: 'skills' | 'languages', item: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.skills.length === 0) {
            setError('Please select at least one skill');
            return;
        }
        if (form.languages.length === 0) {
            setError('Please select at least one language');
            return;
        }

        setLoading(true);
        try {
            await signUp(form.email, form.password, {
                name: form.name,
                email: form.email,
                phone: form.phone,
                role: 'WORKER',
            });

            // Create worker profile
            const user = (await import('firebase/auth')).getAuth().currentUser;
            if (user) {
                await setDoc(doc(db, 'workerProfiles', user.uid), {
                    userId: user.uid,
                    skills: form.skills,
                    experience: parseInt(form.experience) || 0,
                    dailyWage: parseInt(form.dailyWage) || 0,
                    availability: true,
                    location: form.location,
                    languages: form.languages,
                    verificationStatus: 'PENDING',
                    bio: form.bio,
                    createdAt: new Date(),
                });
            }

            router.push('/dashboard/worker');
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
                padding: '6rem 1.5rem 4rem',
                background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)',
            }}>
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>
                            Register as a Worker
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            Create your profile and start getting hired
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

                            {/* Personal Info */}
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '1rem' }}>
                                Personal Information
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Full Name *</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="text" className="input-field input-field-with-icon" placeholder="Your full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phone Number *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="tel" className="input-field input-field-with-icon" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                                    </div>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Email Address *</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type="email" className="input-field input-field-with-icon" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
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

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

                            {/* Professional Info */}
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '1rem' }}>
                                Professional Details
                            </h3>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Skills / Trade *</label>
                                <div className="checkbox-group">
                                    {SKILLS.map(skill => (
                                        <label key={skill} className={`checkbox-label ${form.skills.includes(skill) ? 'checked' : ''}`}>
                                            <input type="checkbox" checked={form.skills.includes(skill)} onChange={() => toggleItem('skills', skill)} />
                                            {skill}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Years of Experience *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Briefcase size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="number" className="input-field input-field-with-icon" placeholder="e.g. 5" min="0" max="50" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Expected Daily Wage (₹) *</label>
                                    <div style={{ position: 'relative' }}>
                                        <IndianRupee size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="number" className="input-field input-field-with-icon" placeholder="e.g. 500" min="0" value={form.dailyWage} onChange={e => setForm(p => ({ ...p, dailyWage: e.target.value }))} required />
                                    </div>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Preferred Location *</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', zIndex: 1 }} />
                                    <select className="select-field" style={{ paddingLeft: '2.5rem' }} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required>
                                        <option value="">Select location</option>
                                        {LOCATIONS.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Languages Spoken *</label>
                                <div className="checkbox-group">
                                    {LANGUAGES.map(lang => (
                                        <label key={lang} className={`checkbox-label ${form.languages.includes(lang) ? 'checked' : ''}`}>
                                            <input type="checkbox" checked={form.languages.includes(lang)} onChange={() => toggleItem('languages', lang)} />
                                            {lang}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Short Bio (optional)</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Tell us about your work experience..."
                                    rows={3}
                                    value={form.bio}
                                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                                {loading ? (
                                    <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
                                ) : (
                                    <>
                                        Create Worker Account
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
