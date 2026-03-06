'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClipboardList, Users, IndianRupee, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Stats {
    pendingRequests: number;
    activeJobs: number;
    completedJobs: number;
    totalWorkers: number;
    verifiedWorkers: number;
    totalRevenue: number;
}

export default function AdminOverview() {
    const [stats, setStats] = useState<Stats>({
        pendingRequests: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalWorkers: 0,
        verifiedWorkers: 0,
        totalRevenue: 0,
    });
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Job requests
            const jobSnap = await getDocs(collection(db, 'jobRequests'));
            const jobs = jobSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Workers
            const workerQ = query(collection(db, 'users'), where('role', '==', 'WORKER'));
            const workerSnap = await getDocs(workerQ);

            // Worker profiles
            const profileSnap = await getDocs(collection(db, 'workerProfiles'));
            const verifiedCount = profileSnap.docs.filter(d => d.data().verificationStatus === 'VERIFIED').length;

            // Transactions
            const txSnap = await getDocs(collection(db, 'transactions'));
            const totalRevenue = txSnap.docs
                .filter(d => d.data().paymentType === 'CUSTOMER_PAYMENT')
                .reduce((sum, d) => sum + (d.data().amount || 0), 0);

            setStats({
                pendingRequests: jobs.filter((j: any) => j.status === 'PENDING').length,
                activeJobs: jobs.filter((j: any) => j.status === 'IN_PROGRESS' || j.status === 'CONFIRMED').length,
                completedJobs: jobs.filter((j: any) => j.status === 'COMPLETED').length,
                totalWorkers: workerSnap.size,
                verifiedWorkers: verifiedCount,
                totalRevenue,
            });

            // Sort recent jobs
            const sorted = jobs.sort((a: any, b: any) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB.getTime() - dateA.getTime();
            });
            setRecentJobs(sorted.slice(0, 5));
        } catch (err) {
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statusBadge: Record<string, string> = {
        PENDING: 'badge-pending',
        CONFIRMED: 'badge-confirmed',
        IN_PROGRESS: 'badge-progress',
        COMPLETED: 'badge-completed',
        CANCELLED: 'badge-cancelled',
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <h1>Dashboard Overview</h1>
                <p>Monitor platform activity and manage operations</p>
            </div>

            <div className="page-content">
                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fef3c7' }}>
                            <Clock size={20} color="#d97706" />
                        </div>
                        <div className="stat-value" style={{ color: '#d97706' }}>{stats.pendingRequests}</div>
                        <div className="stat-label">Pending Requests</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dbeafe' }}>
                            <ClipboardList size={20} color="#2563eb" />
                        </div>
                        <div className="stat-value" style={{ color: '#2563eb' }}>{stats.activeJobs}</div>
                        <div className="stat-label">Active Jobs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dcfce7' }}>
                            <CheckCircle size={20} color="#22c55e" />
                        </div>
                        <div className="stat-value" style={{ color: '#22c55e' }}>{stats.completedJobs}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e0e7ff' }}>
                            <Users size={20} color="#4f46e5" />
                        </div>
                        <div className="stat-value" style={{ color: '#4f46e5' }}>{stats.totalWorkers}</div>
                        <div className="stat-label">Total Workers ({stats.verifiedWorkers} verified)</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dcfce7' }}>
                            <IndianRupee size={20} color="#16a34a" />
                        </div>
                        <div className="stat-value" style={{ color: '#16a34a' }}>₹{stats.totalRevenue.toLocaleString()}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                </div>

                {/* Recent Jobs */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Recent Job Requests</span>
                        <a href="/admin/requests" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>View All</a>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {recentJobs.length === 0 ? (
                            <div className="empty-state">
                                <ClipboardList size={36} style={{ margin: '0 auto 0.5rem', color: 'var(--gray-300)' }} />
                                <h3>No job requests yet</h3>
                                <p>New requests from customers will appear here</p>
                            </div>
                        ) : (
                            <div className="table-container" style={{ border: 'none' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Type</th>
                                            <th>Qty</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentJobs.map((job: any) => (
                                            <tr key={job.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/admin/requests/${job.id}`}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{job.customerName || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{job.customerPhone}</div>
                                                </td>
                                                <td>{job.labourType}</td>
                                                <td>{job.quantity}</td>
                                                <td>{job.location}</td>
                                                <td>
                                                    <span className={`badge ${statusBadge[job.status] || 'badge-pending'}`}>
                                                        {job.status?.replace('_', ' ')}
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
        </>
    );
}
