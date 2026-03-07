'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WorkerProfile, Assignment } from '@/lib/types';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { User, MapPin, Briefcase, IndianRupee, Edit, CheckCircle, Clock, Star, Eye, EyeOff } from 'lucide-react';

export default function WorkerDashboard() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<WorkerProfile | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!userData || userData.role !== 'WORKER') {
            router.push('/login');
            return;
        }
        loadData();
    }, [userData, authLoading]);

    const loadData = async () => {
        if (!userData) return;
        try {
            // Load worker profile
            const profileDoc = await getDoc(doc(db, 'workerProfiles', userData.uid));
            if (profileDoc.exists()) {
                setProfile(profileDoc.data() as WorkerProfile);
            }

            // Load assignments
            const assignQ = query(collection(db, 'assignments'), where('workerId', '==', userData.uid));
            const assignSnap = await getDocs(assignQ);
            setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Assignment[]);
        } catch (err) {
            console.error('Error loading worker data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        if (!userData || !profile) return;
        const newAvail = !profile.availability;
        await updateDoc(doc(db, 'workerProfiles', userData.uid), { availability: newAvail });
        setProfile(prev => prev ? { ...prev, availability: newAvail } : prev);
    };

    if (authLoading || loading) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    if (!userData || userData.role !== 'WORKER') return null;

    const badgeClass = profile?.verificationStatus === 'VERIFIED' ? 'badge-verified' : profile?.verificationStatus === 'REJECTED' ? 'badge-rejected' : 'badge-unverified';

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
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Worker Dashboard</h1>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Welcome back, {userData.name}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {/* Profile Card */}
                        <div className="card" style={{ gridColumn: 'span 1' }}>
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '3rem',
                                            height: '3rem',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '1.125rem',
                                        }}>
                                            {userData.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{userData.name}</h3>
                                            <span className={`badge ${badgeClass}`}>
                                                {profile?.verificationStatus || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {profile && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                            <Briefcase size={14} color="var(--primary-500)" />
                                            {profile.skills.join(', ')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                            <Star size={14} color="var(--primary-500)" />
                                            {profile.experience} years experience
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                            <MapPin size={14} color="var(--primary-500)" />
                                            {profile.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                            <IndianRupee size={14} color="var(--primary-500)" />
                                            ₹{profile.dailyWage}/day expected
                                        </div>
                                    </div>
                                )}

                                {/* Availability Toggle */}
                                <div style={{
                                    marginTop: '1.25rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: profile?.availability ? '#dcfce7' : '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                                        {profile?.availability ? <Eye size={16} color="#166534" /> : <EyeOff size={16} color="#991b1b" />}
                                        <span style={{ color: profile?.availability ? '#166534' : '#991b1b' }}>
                                            {profile?.availability ? 'Available for Work' : 'Not Available'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={toggleAvailability}
                                        style={{
                                            position: 'relative',
                                            width: '3rem',
                                            height: '1.625rem',
                                            borderRadius: '999px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: profile?.availability ? '#22c55e' : '#d1d5db',
                                            transition: 'background 0.3s ease',
                                            padding: 0,
                                            flexShrink: 0,
                                        }}
                                        aria-label="Toggle availability"
                                    >
                                        <span style={{
                                            position: 'absolute',
                                            top: '2px',
                                            left: profile?.availability ? 'calc(100% - 1.375rem - 2px)' : '2px',
                                            width: '1.375rem',
                                            height: '1.375rem',
                                            borderRadius: '50%',
                                            background: 'white',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                            transition: 'left 0.3s ease',
                                        }} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#dbeafe' }}>
                                    <Briefcase size={20} color="#2563eb" />
                                </div>
                                <div className="stat-value">{assignments.length}</div>
                                <div className="stat-label">Total Assignments</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#dcfce7' }}>
                                    <CheckCircle size={20} color="#22c55e" />
                                </div>
                                <div className="stat-value">{assignments.filter(a => a.status === 'COMPLETED').length}</div>
                                <div className="stat-label">Completed Jobs</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#fef3c7' }}>
                                    <Clock size={20} color="#eab308" />
                                </div>
                                <div className="stat-value">{assignments.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length}</div>
                                <div className="stat-label">Active Jobs</div>
                            </div>
                        </div>
                    </div>

                    {/* Assignments */}
                    <div style={{ marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>My Assignments</h2>
                        {assignments.length === 0 ? (
                            <div className="card">
                                <div className="empty-state">
                                    <Briefcase size={40} style={{ margin: '0 auto 0.75rem', color: 'var(--gray-300)' }} />
                                    <h3>No assignments yet</h3>
                                    <p>When you get assigned to a job, it will appear here.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Job</th>
                                            <th>Days</th>
                                            <th>Wage/Day</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.map(a => (
                                            <tr key={a.id}>
                                                <td style={{ fontWeight: 600 }}>{a.jobRequestId.slice(0, 8)}...</td>
                                                <td>{a.daysAssigned}</td>
                                                <td>₹{a.baseWagePerDay}</td>
                                                <td style={{ fontWeight: 600 }}>₹{a.baseWagePerDay * a.daysAssigned}</td>
                                                <td>
                                                    <span className={`badge badge-${a.status === 'COMPLETED' ? 'completed' : a.status === 'IN_PROGRESS' ? 'progress' : 'pending'}`}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
