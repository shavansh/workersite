'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobRequest, Assignment, Transaction } from '@/lib/types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ClipboardList, Plus, MapPin, Calendar, Users, IndianRupee, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusBadge: Record<string, string> = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    IN_PROGRESS: 'badge-progress',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
};

const statusSteps = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

interface JobWithDetails extends JobRequest {
    assignments: Assignment[];
    transactions: Transaction[];
}

export default function CustomerDashboard() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<JobWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

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
            const jobData = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date(),
            })) as JobRequest[];

            // Load assignments and transactions for each job
            const enriched: JobWithDetails[] = await Promise.all(
                jobData.map(async (job) => {
                    const assignQ = query(collection(db, 'assignments'), where('jobRequestId', '==', job.id));
                    const assignSnap = await getDocs(assignQ);
                    const assignments = assignSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Assignment[];

                    const txQ = query(collection(db, 'transactions'), where('jobRequestId', '==', job.id));
                    const txSnap = await getDocs(txQ);
                    const transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().date?.toDate?.() || new Date() })) as Transaction[];

                    return { ...job, assignments, transactions };
                })
            );

            enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setJobs(enriched);
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
                            {jobs.map(job => {
                                const isExpanded = expandedJob === job.id;
                                const totalCost = job.assignments.reduce((s, a) => s + (a.baseWagePerDay + a.markupPerDay) * a.daysAssigned, 0);
                                const totalPaid = job.transactions.filter(t => t.paymentType === 'CUSTOMER_PAYMENT').reduce((s, t) => s + t.amount, 0);
                                const balance = totalCost - totalPaid;
                                const currentStepIndex = statusSteps.indexOf(job.status);

                                return (
                                    <div key={job.id} className="card" style={{ overflow: 'hidden' }}>
                                        <div className="card-body" style={{ cursor: 'pointer' }} onClick={() => setExpandedJob(isExpanded ? null : (job.id || null))}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                        {job.labourType} — {job.quantity} worker{job.quantity > 1 ? 's' : ''}
                                                    </h3>
                                                    <span className={`badge ${statusBadge[job.status] || 'badge-pending'}`}>
                                                        {job.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {totalCost > 0 && (
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Total Cost</div>
                                                            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary-600)' }}>₹{totalCost.toLocaleString()}</div>
                                                        </div>
                                                    )}
                                                    {isExpanded ? <ChevronUp size={18} color="var(--gray-400)" /> : <ChevronDown size={18} color="var(--gray-400)" />}
                                                </div>
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
                                                    {job.assignments.length > 0 ? `${job.assignments.length} assigned` : `${job.quantity} needed`}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem', background: 'var(--gray-50)' }}>
                                                {/* Status Timeline */}
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                                                        Progress
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        {statusSteps.map((step, i) => {
                                                            const isCompleted = i <= currentStepIndex && job.status !== 'CANCELLED';
                                                            const isCurrent = i === currentStepIndex;
                                                            return (
                                                                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        gap: '0.25rem',
                                                                        flex: 1,
                                                                    }}>
                                                                        <div style={{
                                                                            width: '1.5rem',
                                                                            height: '1.5rem',
                                                                            borderRadius: '50%',
                                                                            background: isCompleted ? 'var(--primary-500)' : 'var(--gray-200)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'all 0.3s ease',
                                                                            boxShadow: isCurrent ? '0 0 0 3px var(--primary-100)' : 'none',
                                                                        }}>
                                                                            {isCompleted ? (
                                                                                <CheckCircle size={14} color="white" />
                                                                            ) : (
                                                                                <Clock size={10} color="var(--gray-400)" />
                                                                            )}
                                                                        </div>
                                                                        <span style={{
                                                                            fontSize: '0.625rem',
                                                                            fontWeight: isCurrent ? 700 : 500,
                                                                            color: isCompleted ? 'var(--primary-600)' : 'var(--gray-400)',
                                                                        }}>
                                                                            {step.replace('_', ' ')}
                                                                        </span>
                                                                    </div>
                                                                    {i < statusSteps.length - 1 && (
                                                                        <div style={{
                                                                            height: '2px',
                                                                            flex: 1,
                                                                            background: i < currentStepIndex ? 'var(--primary-500)' : 'var(--gray-200)',
                                                                            marginBottom: '1rem',
                                                                        }} />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {job.status === 'CANCELLED' && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600, marginTop: '0.5rem' }}>
                                                            <AlertCircle size={16} /> This job has been cancelled
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Assigned Workers */}
                                                {job.assignments.length > 0 && (
                                                    <div style={{ marginBottom: '1.5rem' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.625rem' }}>
                                                            Your Team
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            {job.assignments.map(a => (
                                                                <div key={a.id} style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    padding: '0.625rem 0.875rem',
                                                                    background: 'white',
                                                                    borderRadius: 'var(--radius-md)',
                                                                    border: '1px solid var(--border)',
                                                                    fontSize: '0.8125rem',
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <div style={{
                                                                            width: '2rem',
                                                                            height: '2rem',
                                                                            borderRadius: '50%',
                                                                            background: 'var(--primary-50)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: 'var(--primary-600)',
                                                                            fontWeight: 700,
                                                                            fontSize: '0.75rem',
                                                                        }}>
                                                                            {a.workerName?.charAt(0).toUpperCase() || 'W'}
                                                                        </div>
                                                                        <div>
                                                                            <div style={{ fontWeight: 600 }}>{a.workerName}</div>
                                                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                                                                {a.daysAssigned} days × ₹{(a.baseWagePerDay + a.markupPerDay).toLocaleString()}/day
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                                                                        ₹{((a.baseWagePerDay + a.markupPerDay) * a.daysAssigned).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pricing & Payment Summary */}
                                                {totalCost > 0 && (
                                                    <div style={{
                                                        padding: '1rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        background: 'linear-gradient(135deg, var(--secondary-900), var(--secondary-800))',
                                                        color: 'white',
                                                        fontSize: '0.8125rem',
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <span style={{ opacity: 0.7 }}>Total Cost</span>
                                                            <span style={{ fontWeight: 700 }}>₹{totalCost.toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <span style={{ opacity: 0.7 }}>Payments Made</span>
                                                            <span style={{ color: '#86efac', fontWeight: 600 }}>₹{totalPaid.toLocaleString()}</span>
                                                        </div>
                                                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '0.5rem 0' }} />
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.9375rem' }}>
                                                            <span>{balance <= 0 ? 'Fully Paid ✅' : 'Balance Due'}</span>
                                                            <span style={{ color: balance <= 0 ? '#86efac' : '#fca5a5' }}>
                                                                {balance <= 0 ? '₹0' : `₹${balance.toLocaleString()}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Payment History */}
                                                {job.transactions.filter(t => t.paymentType === 'CUSTOMER_PAYMENT').length > 0 && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                                                            Payment History
                                                        </div>
                                                        {job.transactions.filter(t => t.paymentType === 'CUSTOMER_PAYMENT').map(t => (
                                                            <div key={t.id} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '0.5rem 0.875rem',
                                                                background: 'white',
                                                                borderRadius: 'var(--radius-md)',
                                                                border: '1px solid var(--border)',
                                                                fontSize: '0.8125rem',
                                                                marginBottom: '0.375rem',
                                                            }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 600 }}>₹{t.amount.toLocaleString()}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                                                        {t.method} • {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                                    </div>
                                                                </div>
                                                                <span className="badge badge-confirmed" style={{ fontSize: '0.6875rem' }}>Paid</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
