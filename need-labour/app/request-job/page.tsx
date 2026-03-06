'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LABOUR_TYPES, LOCATIONS } from '@/lib/types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Calendar, Users, FileText, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export default function RequestJobPage() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        labourType: '',
        quantity: '',
        location: '',
        preferredStartDate: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (authLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
            </div>
        );
    }

    if (!userData) {
        return (
            <>
                <Navbar />
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6rem 1.5rem 4rem',
                    textAlign: 'center',
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Please log in</h2>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>You need to be logged in as a customer to submit a job request.</p>
                        <button className="btn btn-primary" onClick={() => router.push('/login')}>
                            Go to Login
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (submitted) {
        return (
            <>
                <Navbar />
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6rem 1.5rem 4rem',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '420px' }} className="animate-slideUp">
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            background: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <CheckCircle size={32} color="#22c55e" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Request Submitted!
                        </h2>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                            Your job request has been submitted successfully. Our team will contact you shortly to discuss wages, duration, and finalize the details.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={() => router.push('/dashboard/customer')}>
                                View My Requests
                            </button>
                            <button className="btn btn-outline" onClick={() => { setSubmitted(false); setForm({ labourType: '', quantity: '', location: '', preferredStartDate: '', description: '' }); }}>
                                Submit Another
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await addDoc(collection(db, 'jobRequests'), {
                customerId: userData.uid,
                customerName: userData.name,
                customerPhone: userData.phone,
                labourType: form.labourType,
                quantity: parseInt(form.quantity),
                location: form.location,
                preferredStartDate: form.preferredStartDate,
                description: form.description,
                status: 'PENDING',
                createdAt: new Date(),
            });
            setSubmitted(true);
        } catch {
            setError('Failed to submit request. Please try again.');
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
                <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>
                            Submit a Job Request
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            Tell us what workers you need — we&apos;ll handle the rest
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
                                <label className="input-label">Type of Labour *</label>
                                <select className="select-field" value={form.labourType} onChange={e => setForm(p => ({ ...p, labourType: e.target.value }))} required>
                                    <option value="">Select labour type</option>
                                    {LABOUR_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Number of Workers *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Users size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="number" className="input-field input-field-with-icon" placeholder="e.g. 3" min="1" max="100" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Preferred Start Date *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="date" className="input-field input-field-with-icon" value={form.preferredStartDate} onChange={e => setForm(p => ({ ...p, preferredStartDate: e.target.value }))} required />
                                    </div>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Job Location *</label>
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

                            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Job Description *</label>
                                <div style={{ position: 'relative' }}>
                                    <FileText size={16} style={{ position: 'absolute', left: '0.875rem', top: '0.75rem', color: 'var(--gray-400)' }} />
                                    <textarea
                                        className="input-field"
                                        placeholder="Describe your project — e.g. 'Need 3 masons for house construction, 2nd floor work, must have experience with brick and cement work...'"
                                        rows={4}
                                        value={form.description}
                                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        required
                                        style={{ paddingLeft: '2.5rem', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                padding: '0.75rem 1rem',
                                background: '#eff6ff',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8125rem',
                                color: '#1e3a8a',
                                marginBottom: '1.5rem',
                                lineHeight: 1.6,
                            }}>
                                💡 <strong>No need to set wages.</strong> Our team will call you to discuss rates and finalize everything.
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                                {loading ? (
                                    <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
                                ) : (
                                    <>
                                        Submit Request
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
