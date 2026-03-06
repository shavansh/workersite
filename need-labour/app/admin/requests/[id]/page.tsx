'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobRequest, WorkerProfile, UserData, Assignment, Transaction } from '@/lib/types';
import { ArrowLeft, Phone, MapPin, Calendar, Users, IndianRupee, CheckCircle, Plus, X, Search, UserCheck, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusBadge: Record<string, string> = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    IN_PROGRESS: 'badge-progress',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
};

interface WorkerWithProfile extends UserData {
    profile?: WorkerProfile;
}

export default function AdminRequestDetail() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [job, setJob] = useState<JobRequest | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Team building
    const [showWorkerSearch, setShowWorkerSearch] = useState(false);
    const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
    const [workerSearch, setWorkerSearch] = useState('');
    const [selectedWorker, setSelectedWorker] = useState<WorkerWithProfile | null>(null);
    const [assignForm, setAssignForm] = useState({ daysAssigned: '', baseWagePerDay: '', markupPerDay: '50' });

    // Payment recording
    const [showPayment, setShowPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', notes: '', paymentType: 'CUSTOMER_PAYMENT' as 'CUSTOMER_PAYMENT' | 'WORKER_PAYOUT' });

    // Admin notes
    const [adminNotes, setAdminNotes] = useState('');
    const [wageModel, setWageModel] = useState('');
    const [agreedWage, setAgreedWage] = useState('');

    useEffect(() => {
        loadData();
    }, [jobId]);

    const loadData = async () => {
        try {
            // Load job
            const jobDoc = await getDoc(doc(db, 'jobRequests', jobId));
            if (!jobDoc.exists()) {
                router.push('/admin/requests');
                return;
            }
            const jobData = { id: jobDoc.id, ...jobDoc.data(), createdAt: jobDoc.data().createdAt?.toDate?.() || new Date() } as JobRequest;
            setJob(jobData);
            setAdminNotes(jobData.adminNotes || '');
            setWageModel(jobData.wageModel || '');
            setAgreedWage(jobData.agreedWage?.toString() || '');

            // Load assignments
            const assignQ = query(collection(db, 'assignments'), where('jobRequestId', '==', jobId));
            const assignSnap = await getDocs(assignQ);
            setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Assignment[]);

            // Load transactions
            const txQ = query(collection(db, 'transactions'), where('jobRequestId', '==', jobId));
            const txSnap = await getDocs(txQ);
            setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]);
        } catch (err) {
            console.error('Error loading job:', err);
        } finally {
            setLoading(false);
        }
    };

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
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            await updateDoc(doc(db, 'jobRequests', jobId), { status: newStatus });
            setJob(prev => prev ? { ...prev, status: newStatus as any } : prev);
            setSuccess(`Status updated to ${newStatus}`);
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to update status');
        }
    };

    const saveNotes = async () => {
        try {
            await updateDoc(doc(db, 'jobRequests', jobId), {
                adminNotes,
                wageModel: wageModel || null,
                agreedWage: agreedWage ? parseInt(agreedWage) : null,
            });
            setSuccess('Notes saved');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to save notes');
        }
    };

    const assignWorker = async () => {
        if (!selectedWorker || !assignForm.daysAssigned || !assignForm.baseWagePerDay) return;
        const days = parseInt(assignForm.daysAssigned);
        const base = parseInt(assignForm.baseWagePerDay);
        const markup = parseInt(assignForm.markupPerDay) || 50;
        const total = (base + markup) * days;

        try {
            const docRef = await addDoc(collection(db, 'assignments'), {
                jobRequestId: jobId,
                workerId: selectedWorker.uid,
                workerName: selectedWorker.name,
                daysAssigned: days,
                baseWagePerDay: base,
                markupPerDay: markup,
                totalCost: total,
                status: 'ASSIGNED',
            });
            setAssignments(prev => [...prev, { id: docRef.id, jobRequestId: jobId, workerId: selectedWorker.uid, workerName: selectedWorker.name, daysAssigned: days, baseWagePerDay: base, markupPerDay: markup, totalCost: total, status: 'ASSIGNED' }]);
            setSelectedWorker(null);
            setAssignForm({ daysAssigned: '', baseWagePerDay: '', markupPerDay: '50' });
            setShowWorkerSearch(false);

            // Update total cost on job
            const newTotal = [...assignments, { totalCost: total }].reduce((sum, a) => sum + a.totalCost, 0);
            await updateDoc(doc(db, 'jobRequests', jobId), { totalCost: newTotal });
            setJob(prev => prev ? { ...prev, totalCost: newTotal } : prev);
            setSuccess('Worker assigned!');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to assign worker');
        }
    };

    const recordPayment = async () => {
        if (!paymentForm.amount) return;
        try {
            const docRef = await addDoc(collection(db, 'transactions'), {
                jobRequestId: jobId,
                amount: parseFloat(paymentForm.amount),
                paymentType: paymentForm.paymentType,
                method: paymentForm.method,
                date: new Date(),
                notes: paymentForm.notes,
            });
            setTransactions(prev => [...prev, {
                id: docRef.id,
                jobRequestId: jobId,
                amount: parseFloat(paymentForm.amount),
                paymentType: paymentForm.paymentType as any,
                method: paymentForm.method,
                date: new Date(),
                notes: paymentForm.notes,
            }]);
            setPaymentForm({ amount: '', method: 'Cash', notes: '', paymentType: 'CUSTOMER_PAYMENT' });
            setShowPayment(false);
            setSuccess('Payment recorded!');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to record payment');
        }
    };

    const filteredWorkers = workers.filter(w => {
        if (!workerSearch) return true;
        const term = workerSearch.toLowerCase();
        return w.name.toLowerCase().includes(term) ||
            w.profile?.skills.some(s => s.toLowerCase().includes(term)) ||
            w.profile?.location.toLowerCase().includes(term);
    });

    const totalAssignmentCost = assignments.reduce((sum, a) => sum + a.totalCost, 0);
    const totalBaseWages = assignments.reduce((sum, a) => sum + a.baseWagePerDay * a.daysAssigned, 0);
    const totalMarkup = assignments.reduce((sum, a) => sum + a.markupPerDay * a.daysAssigned, 0);
    const totalPaid = transactions.filter(t => t.paymentType === 'CUSTOMER_PAYMENT').reduce((sum, t) => sum + t.amount, 0);
    const totalPaidOut = transactions.filter(t => t.paymentType === 'WORKER_PAYOUT').reduce((sum, t) => sum + t.amount, 0);

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;
    }

    if (!job) return null;

    return (
        <>
            {/* Toasts */}
            {success && <div className="toast toast-success">{success}</div>}
            {error && <div className="toast toast-error">{error}</div>}

            <div className="page-header">
                <button className="btn btn-ghost btn-sm" onClick={() => router.push('/admin/requests')} style={{ marginBottom: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Requests
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h1>{job.labourType} — {job.quantity} Workers</h1>
                        <p>Submitted by {job.customerName}</p>
                    </div>
                    <span className={`badge ${statusBadge[job.status]}`} style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}>
                        {job.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="page-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Job Details Card */}
                        <div className="card">
                            <div className="card-header">Job Details</div>
                            <div className="card-body">
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem', lineHeight: 1.7 }}>
                                    {job.description}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                        <Users size={15} color="var(--primary-500)" /> {job.quantity} {job.labourType} needed
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                        <MapPin size={15} color="var(--primary-500)" /> {job.location}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                        <Calendar size={15} color="var(--primary-500)" /> Start: {job.preferredStartDate}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                                        <Phone size={15} color="var(--primary-500)" /> {job.customerPhone}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Update */}
                        <div className="card">
                            <div className="card-header">Update Status</div>
                            <div className="card-body">
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {STATUS_OPTIONS.map(s => (
                                        <button
                                            key={s}
                                            className={`btn btn-sm ${job.status === s ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => updateStatus(s)}
                                        >
                                            {s.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div className="card">
                            <div className="card-header">Admin Notes (Post-Call)</div>
                            <div className="card-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Wage Model</label>
                                        <select className="select-field" value={wageModel} onChange={e => setWageModel(e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="DAILY">Daily Wage</option>
                                            <option value="THEKA">Theka (Contract)</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Agreed Wage (₹)</label>
                                        <input type="number" className="input-field" placeholder="e.g. 500" value={agreedWage} onChange={e => setAgreedWage(e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                                    <label className="input-label">Call Notes</label>
                                    <textarea className="input-field" rows={3} placeholder="Notes from customer call..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} style={{ resize: 'vertical' }} />
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={saveNotes}>Save Notes</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Pricing Summary */}
                        <div className="card" style={{ background: 'linear-gradient(135deg, var(--secondary-900), var(--secondary-800))', color: 'white' }}>
                            <div className="card-body">
                                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem', opacity: 0.9 }}>Pricing Summary</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                                        <span>Base Wages</span>
                                        <span>₹{totalBaseWages.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                                        <span>Admin Commission</span>
                                        <span>₹{totalMarkup.toLocaleString()}</span>
                                    </div>
                                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '0.25rem 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                                        <span>Total Customer Price</span>
                                        <span>₹{totalAssignmentCost.toLocaleString()}</span>
                                    </div>
                                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '0.25rem 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                                        <span>Received from Customer</span>
                                        <span style={{ color: '#86efac' }}>₹{totalPaid.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                                        <span>Paid to Workers</span>
                                        <span style={{ color: '#fca5a5' }}>₹{totalPaidOut.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                        <span>Profit</span>
                                        <span style={{ color: '#86efac' }}>₹{(totalPaid - totalPaidOut).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assigned Workers */}
                        <div className="card">
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Assigned Team ({assignments.length})</span>
                                <button className="btn btn-primary btn-sm" onClick={() => { setShowWorkerSearch(true); loadWorkers(); }}>
                                    <Plus size={14} /> Add Worker
                                </button>
                            </div>
                            <div className="card-body" style={{ padding: assignments.length === 0 ? undefined : 0 }}>
                                {assignments.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                                        <Users size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--gray-300)' }} />
                                        <h3 style={{ fontSize: '0.875rem' }}>No workers assigned</h3>
                                        <p style={{ fontSize: '0.75rem' }}>Click "Add Worker" to build the team</p>
                                    </div>
                                ) : (
                                    <div style={{ overflow: 'auto' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Worker</th>
                                                    <th>Days</th>
                                                    <th>Wage</th>
                                                    <th>+Markup</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assignments.map(a => (
                                                    <tr key={a.id}>
                                                        <td style={{ fontWeight: 600 }}>{a.workerName}</td>
                                                        <td>{a.daysAssigned}</td>
                                                        <td>₹{a.baseWagePerDay}</td>
                                                        <td>₹{a.markupPerDay}</td>
                                                        <td style={{ fontWeight: 700 }}>₹{a.totalCost.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payments */}
                        <div className="card">
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Payments ({transactions.length})</span>
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowPayment(true)}>
                                    <Plus size={14} /> Record Payment
                                </button>
                            </div>
                            <div className="card-body" style={{ padding: transactions.length === 0 ? undefined : 0 }}>
                                {transactions.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                                        <IndianRupee size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--gray-300)' }} />
                                        <h3 style={{ fontSize: '0.875rem' }}>No payments recorded</h3>
                                    </div>
                                ) : (
                                    <div style={{ overflow: 'auto' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Amount</th>
                                                    <th>Method</th>
                                                    <th>Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map(t => (
                                                    <tr key={t.id}>
                                                        <td>
                                                            <span className={`badge ${t.paymentType === 'CUSTOMER_PAYMENT' ? 'badge-confirmed' : 'badge-pending'}`}>
                                                                {t.paymentType === 'CUSTOMER_PAYMENT' ? 'Received' : 'Payout'}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontWeight: 600 }}>₹{t.amount.toLocaleString()}</td>
                                                        <td>{t.method}</td>
                                                        <td style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{t.notes || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Worker Search Modal */}
            {showWorkerSearch && (
                <div className="modal-overlay" onClick={() => setShowWorkerSearch(false)}>
                    <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Assign Worker</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowWorkerSearch(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            {selectedWorker ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                        <UserCheck size={20} color="var(--primary-600)" />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{selectedWorker.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                {selectedWorker.profile?.skills.join(', ')} • ₹{selectedWorker.profile?.dailyWage}/day
                                            </div>
                                        </div>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedWorker(null)} style={{ marginLeft: 'auto' }}><X size={14} /></button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div className="input-group">
                                            <label className="input-label">Days *</label>
                                            <input type="number" className="input-field" placeholder="e.g. 10" value={assignForm.daysAssigned} onChange={e => setAssignForm(p => ({ ...p, daysAssigned: e.target.value }))} />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Wage/Day (₹) *</label>
                                            <input type="number" className="input-field" placeholder={selectedWorker.profile?.dailyWage?.toString()} value={assignForm.baseWagePerDay} onChange={e => setAssignForm(p => ({ ...p, baseWagePerDay: e.target.value }))} />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Markup/Day (₹)</label>
                                            <input type="number" className="input-field" value={assignForm.markupPerDay} onChange={e => setAssignForm(p => ({ ...p, markupPerDay: e.target.value }))} />
                                        </div>
                                    </div>

                                    {assignForm.daysAssigned && assignForm.baseWagePerDay && (
                                        <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span>Base: ₹{assignForm.baseWagePerDay} × {assignForm.daysAssigned} days</span>
                                                <span>₹{parseInt(assignForm.baseWagePerDay) * parseInt(assignForm.daysAssigned)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span>Markup: ₹{assignForm.markupPerDay} × {assignForm.daysAssigned} days</span>
                                                <span>₹{parseInt(assignForm.markupPerDay || '50') * parseInt(assignForm.daysAssigned)}</span>
                                            </div>
                                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.375rem 0' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                                <span>Total</span>
                                                <span>₹{((parseInt(assignForm.baseWagePerDay) + parseInt(assignForm.markupPerDay || '50')) * parseInt(assignForm.daysAssigned)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                        <input type="text" className="input-field input-field-with-icon" placeholder="Search workers by name, skill, location..." value={workerSearch} onChange={e => setWorkerSearch(e.target.value)} />
                                    </div>
                                    <div style={{ maxHeight: '300px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {filteredWorkers.map(w => (
                                            <div key={w.uid} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                            }} onClick={() => { setSelectedWorker(w); setAssignForm(p => ({ ...p, baseWagePerDay: w.profile?.dailyWage?.toString() || '' })); }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                        {w.name}
                                                        {w.profile?.verificationStatus === 'VERIFIED' && (
                                                            <CheckCircle size={14} color="#22c55e" style={{ display: 'inline', marginLeft: '0.375rem' }} />
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                        {w.profile?.skills.join(', ')} • {w.profile?.location} • ₹{w.profile?.dailyWage}/day
                                                    </div>
                                                </div>
                                                <div style={{
                                                    width: '0.5rem',
                                                    height: '0.5rem',
                                                    borderRadius: '50%',
                                                    background: w.profile?.availability ? '#22c55e' : '#ef4444',
                                                }} />
                                            </div>
                                        ))}
                                        {filteredWorkers.length === 0 && (
                                            <div className="empty-state" style={{ padding: '1.5rem' }}>
                                                <h3 style={{ fontSize: '0.875rem' }}>No workers found</h3>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowWorkerSearch(false)}>Cancel</button>
                            {selectedWorker && (
                                <button className="btn btn-primary" onClick={assignWorker} disabled={!assignForm.daysAssigned || !assignForm.baseWagePerDay}>
                                    Assign Worker
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayment && (
                <div className="modal-overlay" onClick={() => setShowPayment(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Record Payment</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowPayment(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="input-label">Payment Type *</label>
                                <select className="select-field" value={paymentForm.paymentType} onChange={e => setPaymentForm(p => ({ ...p, paymentType: e.target.value as any }))}>
                                    <option value="CUSTOMER_PAYMENT">Customer Payment (Received)</option>
                                    <option value="WORKER_PAYOUT">Worker Payout (Paid Out)</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Amount (₹) *</label>
                                    <input type="number" className="input-field" placeholder="e.g. 5000" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Method *</label>
                                    <select className="select-field" value={paymentForm.method} onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value }))}>
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Notes</label>
                                <textarea className="input-field" rows={2} placeholder="Optional notes..." value={paymentForm.notes} onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowPayment(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={recordPayment} disabled={!paymentForm.amount}>
                                Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
