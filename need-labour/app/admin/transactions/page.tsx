'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/lib/types';
import { IndianRupee, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const snap = await getDocs(collection(db, 'transactions'));
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                date: d.data().date?.toDate?.() || new Date(),
            })) as Transaction[];
            data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(data);
        } catch (err) {
            console.error('Error loading transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = transactions.filter(t => {
        if (typeFilter === 'ALL') return true;
        return t.paymentType === typeFilter;
    });

    const totalIn = transactions.filter(t => t.paymentType === 'CUSTOMER_PAYMENT').reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter(t => t.paymentType === 'WORKER_PAYOUT').reduce((s, t) => s + t.amount, 0);

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;
    }

    return (
        <>
            <div className="page-header">
                <h1>Transactions</h1>
                <p>Track all payments and payouts</p>
            </div>

            <div className="page-content">
                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dcfce7' }}>
                            <ArrowDownLeft size={20} color="#16a34a" />
                        </div>
                        <div className="stat-value" style={{ color: '#16a34a' }}>₹{totalIn.toLocaleString()}</div>
                        <div className="stat-label">Total Received</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fee2e2' }}>
                            <ArrowUpRight size={20} color="#dc2626" />
                        </div>
                        <div className="stat-value" style={{ color: '#dc2626' }}>₹{totalOut.toLocaleString()}</div>
                        <div className="stat-label">Total Paid Out</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dbeafe' }}>
                            <IndianRupee size={20} color="#2563eb" />
                        </div>
                        <div className="stat-value" style={{ color: '#2563eb' }}>₹{(totalIn - totalOut).toLocaleString()}</div>
                        <div className="stat-label">Net Profit</div>
                    </div>
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <select className="select-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto', minWidth: '180px' }}>
                        <option value="ALL">All Transactions</option>
                        <option value="CUSTOMER_PAYMENT">Customer Payments</option>
                        <option value="WORKER_PAYOUT">Worker Payouts</option>
                    </select>
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <IndianRupee size={36} style={{ margin: '0 auto 0.5rem', color: 'var(--gray-300)' }} />
                            <h3>No transactions yet</h3>
                            <p>Recorded payments will appear here</p>
                        </div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Job ID</th>
                                    <th>Date</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {t.paymentType === 'CUSTOMER_PAYMENT' ? (
                                                    <ArrowDownLeft size={16} color="#16a34a" />
                                                ) : (
                                                    <ArrowUpRight size={16} color="#dc2626" />
                                                )}
                                                <span className={`badge ${t.paymentType === 'CUSTOMER_PAYMENT' ? 'badge-completed' : 'badge-pending'}`}>
                                                    {t.paymentType === 'CUSTOMER_PAYMENT' ? 'Received' : 'Payout'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: t.paymentType === 'CUSTOMER_PAYMENT' ? '#16a34a' : '#dc2626' }}>
                                            {t.paymentType === 'CUSTOMER_PAYMENT' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                        </td>
                                        <td>{t.method}</td>
                                        <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                            {t.jobRequestId.slice(0, 8)}...
                                        </td>
                                        <td style={{ fontSize: '0.8125rem' }}>
                                            {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ fontSize: '0.75rem', color: 'var(--gray-500)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {t.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
