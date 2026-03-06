'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobRequest } from '@/lib/types';
import Link from 'next/link';
import { Search, Filter, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

const statusBadge: Record<string, string> = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    IN_PROGRESS: 'badge-progress',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
};

export default function AdminRequests() {
    const [jobs, setJobs] = useState<JobRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const snap = await getDocs(collection(db, 'jobRequests'));
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

    const filtered = jobs.filter(j => {
        if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                j.customerName?.toLowerCase().includes(term) ||
                j.labourType.toLowerCase().includes(term) ||
                j.location.toLowerCase().includes(term) ||
                j.description.toLowerCase().includes(term)
            );
        }
        return true;
    });

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
                <h1>Job Requests</h1>
                <p>Manage all customer job requests</p>
            </div>

            <div className="page-content">
                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input
                            type="text"
                            className="input-field input-field-with-icon"
                            placeholder="Search by customer, type, location..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="select-field"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ width: 'auto', minWidth: '150px' }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {/* Results count */}
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                    Showing {filtered.length} of {jobs.length} requests
                </p>

                {/* Jobs */}
                {filtered.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <h3>No requests found</h3>
                            <p>Try adjusting your filters</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filtered.map(job => (
                            <Link key={job.id} href={`/admin/requests/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}>
                                    <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                                                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                                                    {job.customerName || 'Unknown Customer'}
                                                </h3>
                                                <span className={`badge ${statusBadge[job.status] || 'badge-pending'}`}>
                                                    {job.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                                                {job.description.length > 80 ? job.description.slice(0, 80) + '...' : job.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Users size={12} /> {job.quantity} {job.labourType}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={12} /> {job.location}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={12} /> {job.preferredStartDate}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} color="var(--gray-400)" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
