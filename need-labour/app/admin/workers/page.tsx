'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData, WorkerProfile } from '@/lib/types';
import { Search, CheckCircle, XCircle, MapPin, Star, IndianRupee, Shield, Eye } from 'lucide-react';

interface WorkerWithProfile extends UserData {
    profile?: WorkerProfile;
}

export default function AdminWorkers() {
    const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        try {
            const workerQ = query(collection(db, 'users'), where('role', '==', 'WORKER'));
            const workerSnap = await getDocs(workerQ);
            const workerData: WorkerWithProfile[] = [];

            for (const d of workerSnap.docs) {
                const user = { uid: d.id, ...d.data() } as UserData;
                const profileDoc = await getDoc(doc(db, 'workerProfiles', d.id));
                workerData.push({
                    ...user,
                    profile: profileDoc.exists() ? profileDoc.data() as WorkerProfile : undefined,
                });
            }
            setWorkers(workerData);
        } catch (err) {
            console.error('Error loading workers:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateVerification = async (workerId: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            await updateDoc(doc(db, 'workerProfiles', workerId), { verificationStatus: status });
            setWorkers(prev => prev.map(w => w.uid === workerId ? { ...w, profile: w.profile ? { ...w.profile, verificationStatus: status } : undefined } : w));
        } catch (err) {
            console.error('Error updating verification:', err);
        }
    };

    const filtered = workers.filter(w => {
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'AVAILABLE' && !w.profile?.availability) return false;
            if (statusFilter === 'VERIFIED' && w.profile?.verificationStatus !== 'VERIFIED') return false;
            if (statusFilter === 'PENDING' && w.profile?.verificationStatus !== 'PENDING') return false;
        }
        if (skillFilter && !w.profile?.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return w.name.toLowerCase().includes(term) ||
                w.phone?.toLowerCase().includes(term) ||
                w.profile?.location.toLowerCase().includes(term) ||
                w.profile?.skills.some(s => s.toLowerCase().includes(term));
        }
        return true;
    });

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;
    }

    return (
        <>
            <div className="page-header">
                <h1>Workers ({workers.length})</h1>
                <p>Manage and verify worker profiles</p>
            </div>

            <div className="page-content">
                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input type="text" className="input-field input-field-with-icon" placeholder="Search by name, phone, location, skill..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="select-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
                        <option value="ALL">All Workers</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="PENDING">Pending Verification</option>
                    </select>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                    Showing {filtered.length} workers
                </p>

                {/* Workers Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filtered.map(w => (
                        <div key={w.uid} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '0.9375rem',
                                        }}>
                                            {w.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{w.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{w.phone}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '0.625rem',
                                        height: '0.625rem',
                                        borderRadius: '50%',
                                        background: w.profile?.availability ? '#22c55e' : '#ef4444',
                                        boxShadow: w.profile?.availability ? '0 0 6px #22c55e' : 'none',
                                    }} title={w.profile?.availability ? 'Available' : 'Not Available'} />
                                </div>

                                {w.profile && (
                                    <>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                                            {w.profile.skills.map(s => (
                                                <span key={s} style={{
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: 'var(--primary-50)',
                                                    color: 'var(--primary-700)',
                                                    fontSize: '0.6875rem',
                                                    fontWeight: 600,
                                                }}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <MapPin size={12} color="var(--gray-400)" /> {w.profile.location}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Star size={12} color="var(--gray-400)" /> {w.profile.experience} yrs exp
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <IndianRupee size={12} color="var(--gray-400)" /> ₹{w.profile.dailyWage}/day
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                                            <span className={`badge ${w.profile.verificationStatus === 'VERIFIED' ? 'badge-verified' : w.profile.verificationStatus === 'REJECTED' ? 'badge-rejected' : 'badge-unverified'}`}>
                                                {w.profile.verificationStatus}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                {w.profile.verificationStatus !== 'VERIFIED' && (
                                                    <button className="btn btn-sm" onClick={() => updateVerification(w.uid, 'VERIFIED')} style={{ background: '#dcfce7', color: '#166534', fontSize: '0.75rem' }}>
                                                        <CheckCircle size={12} /> Verify
                                                    </button>
                                                )}
                                                {w.profile.verificationStatus !== 'REJECTED' && (
                                                    <button className="btn btn-sm" onClick={() => updateVerification(w.uid, 'REJECTED')} style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem' }}>
                                                        <XCircle size={12} /> Reject
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="card">
                        <div className="empty-state">
                            <h3>No workers found</h3>
                            <p>Adjust your filters or wait for new registrations</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
