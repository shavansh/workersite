'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobRequest } from '@/lib/types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ClipboardList, Plus, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

const statusBadge: Record<string, string> = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    IN_PROGRESS: 'badge-progress',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
};

export default function CustomerDashboard() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<JobRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!userData || userData.role !== 'CUSTOMER') {
            router.push('/login');
            return;
        }
        loadJobs();
    }, [userData, authLoading]);

    const loadJobs = async () => {
        if (!userData) return;
        try {
            const q = query(
                collection(db, 'jobRequests'),
                where('customerId', '==', userData.uid)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date(),
            })) as JobRequest[];
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setJobs(data);
        } catch (err) {
            console.error('Error loading jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    if (!userData || userData.role !== 'CUSTOMER') return null;

    return (
        <>
            <Navbar />
            <div style={{
                minHeight: '100vh',
                padding: '5rem 1.5rem 4rem',
                background: 'var(--gray-50)',
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Job Requests</h1>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Welcome back, {userData.name}</p>
                        </div>
                        <Link href="/request-job" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            <Plus size={16} />
                            New Request
                        </Link>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: 'var(--primary-600)' }}>{jobs.length}</div>
                            <div className="stat-label">Total Requests</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#eab308' }}>{jobs.filter(j => j.status === 'PENDING').length}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#3b82f6' }}>{jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'CONFIRMED').length}</div>
                            <div className="stat-label">Active</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#22c55e' }}>{jobs.filter(j => j.status === 'COMPLETED').length}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    {jobs.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <ClipboardList size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--gray-300)' }} />
                                <h3>No job requests yet</h3>
                                <p>Submit your first job request to get started!</p>
                                <Link href="/request-job" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
                                    <Plus size={16} />
                                    Submit Request
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {jobs.map(job => (
                                <div key={job.id} className="card" style={{ transition: 'all 0.2s ease' }}>
                                    <div className="card-body">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                    {job.labourType} — {job.quantity} worker{job.quantity > 1 ? 's' : ''}
                                                </h3>
                                                <span className={`badge ${statusBadge[job.status] || 'badge-pending'}`}>
                                                    {job.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {job.totalCost && (
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Total Cost</div>
                                                    <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary-600)' }}>₹{job.totalCost.toLocaleString()}</div>
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                                            {job.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <MapPin size={14} color="var(--primary-500)" />
                                                {job.location}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Calendar size={14} color="var(--primary-500)" />
                                                {job.preferredStartDate}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Users size={14} color="var(--primary-500)" />
                                                {job.quantity} workers needed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
