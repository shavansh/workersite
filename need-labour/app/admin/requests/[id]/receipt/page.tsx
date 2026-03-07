'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobRequest, Assignment, Transaction } from '@/lib/types';
import { Printer, ArrowLeft, HardHat } from 'lucide-react';

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobRequest | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const jobDoc = await getDoc(doc(db, 'jobRequests', jobId));
      if (!jobDoc.exists()) { router.push('/admin/requests'); return; }
      setJob({ id: jobDoc.id, ...jobDoc.data(), createdAt: jobDoc.data().createdAt?.toDate?.() || new Date() } as JobRequest);

      const assignSnap = await getDocs(query(collection(db, 'assignments'), where('jobRequestId', '==', jobId)));
      setAssignments(assignSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Assignment[]);

      const txSnap = await getDocs(query(collection(db, 'transactions'), where('jobRequestId', '==', jobId)));
      setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().date?.toDate?.() || new Date() })) as Transaction[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!job) return null;

  const totalCost = assignments.reduce((s, a) => s + (a.baseWagePerDay + a.markupPerDay) * a.daysAssigned, 0);
  const customerPayments = transactions.filter(t => t.paymentType === 'CUSTOMER_PAYMENT');
  const totalPaid = customerPayments.reduce((s, t) => s + t.amount, 0);
  const balance = totalCost - totalPaid;
  const receiptNo = `NL-${new Date().getFullYear()}-${jobId.slice(0, 6).toUpperCase()}`;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      {/* Screen-only controls */}
      <div className="no-print" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', background: 'var(--gray-100)', borderBottom: '1px solid var(--border)' }}>
        <button className="btn btn-outline btn-sm" onClick={() => router.push(`/admin/requests/${jobId}`)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Receipt */}
      <div className="receipt-page">
        <div className="receipt-container">
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-brand">
              <HardHat size={28} />
              <div>
                <h1>NeedLabour</h1>
                <p>Labour Hiring Services — Jammu</p>
              </div>
            </div>
            <div className="receipt-meta">
              <h2>RECEIPT</h2>
              <p><strong>No:</strong> {receiptNo}</p>
              <p><strong>Date:</strong> {today}</p>
              <p>
                <span className={`receipt-status ${balance <= 0 ? 'paid' : 'pending'}`}>
                  {balance <= 0 ? '✅ FULLY PAID' : '⏳ BALANCE DUE'}
                </span>
              </p>
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* Customer Info */}
          <div className="receipt-section">
            <div className="receipt-section-title">BILL TO</div>
            <div className="receipt-info-grid">
              <div>
                <strong>{job.customerName}</strong>
                <p>{job.customerPhone}</p>
              </div>
              <div>
                <strong>Job Location</strong>
                <p>{job.location}</p>
              </div>
            </div>
          </div>

          {/* Job Info */}
          <div className="receipt-section">
            <div className="receipt-section-title">JOB DETAILS</div>
            <div className="receipt-info-grid">
              <div>
                <strong>Type:</strong> {job.labourType}
              </div>
              <div>
                <strong>Workers:</strong> {job.quantity}
              </div>
              <div>
                <strong>Start Date:</strong> {job.preferredStartDate}
              </div>
              <div>
                <strong>Status:</strong> {job.status.replace('_', ' ')}
              </div>
            </div>
            {job.description && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#555' }}>
                {job.description}
              </p>
            )}
          </div>

          {/* Workers & Charges */}
          <div className="receipt-section">
            <div className="receipt-section-title">CHARGES BREAKDOWN</div>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Days</th>
                  <th>Rate/Day</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td>{a.workerName}</td>
                    <td>{a.daysAssigned}</td>
                    <td>₹{(a.baseWagePerDay + a.markupPerDay).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>₹{((a.baseWagePerDay + a.markupPerDay) * a.daysAssigned).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>₹{totalCost.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payments */}
          {customerPayments.length > 0 && (
            <div className="receipt-section">
              <div className="receipt-section-title">PAYMENTS RECEIVED</div>
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {customerPayments.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>{t.method}</td>
                      <td style={{ color: '#777' }}>{t.notes || '-'}</td>
                      <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>₹{t.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total Paid:</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{totalPaid.toLocaleString()}</td>
                  </tr>
                  {balance > 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>Balance Due:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{balance.toLocaleString()}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          )}

          {/* Footer */}
          <hr className="receipt-divider" />
          <div className="receipt-footer">
            <p>Thank you for choosing <strong>NeedLabour</strong></p>
            <p>For queries, contact us at: <strong>+91-7006271770</strong></p>
            <p className="receipt-note">This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          .receipt-page { padding: 0; }
          .receipt-container { box-shadow: none; border: none; max-width: 100%; }
        }
      `}</style>

      <style jsx>{`
        .receipt-page {
          min-height: 100vh;
          background: #f0f0f0;
          padding: 2rem;
          display: flex;
          justify-content: center;
        }
        .receipt-container {
          background: white;
          max-width: 700px;
          width: 100%;
          padding: 2.5rem;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          border-radius: 8px;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1a1a1a;
          height: fit-content;
        }
        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .receipt-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #e67e22;
        }
        .receipt-brand h1 {
          font-size: 1.375rem;
          font-weight: 900;
          margin: 0;
          color: #1a365d;
        }
        .receipt-brand p {
          font-size: 0.75rem;
          color: #777;
          margin: 0;
        }
        .receipt-meta {
          text-align: right;
        }
        .receipt-meta h2 {
          font-size: 1.5rem;
          font-weight: 900;
          color: #1a365d;
          margin: 0 0 0.375rem;
          letter-spacing: 2px;
        }
        .receipt-meta p {
          font-size: 0.8125rem;
          color: #555;
          margin: 0.125rem 0;
        }
        .receipt-status {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-top: 0.25rem;
        }
        .receipt-status.paid {
          background: #dcfce7;
          color: #166534;
        }
        .receipt-status.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .receipt-divider {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .receipt-section {
          margin-bottom: 1.5rem;
        }
        .receipt-section-title {
          font-size: 0.6875rem;
          font-weight: 800;
          color: #e67e22;
          letter-spacing: 1.5px;
          margin-bottom: 0.625rem;
          text-transform: uppercase;
        }
        .receipt-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        .receipt-info-grid strong {
          font-weight: 700;
        }
        .receipt-info-grid p {
          margin: 0;
          color: #555;
        }
        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .receipt-table th {
          background: #f8f9fa;
          padding: 0.625rem 0.75rem;
          text-align: left;
          font-weight: 700;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .receipt-table td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #f0f0f0;
          color: #333;
        }
        .receipt-table tfoot td {
          border-bottom: none;
          border-top: 2px solid #e5e7eb;
          padding-top: 0.75rem;
        }
        .receipt-footer {
          text-align: center;
          font-size: 0.8125rem;
          color: #555;
        }
        .receipt-footer p {
          margin: 0.25rem 0;
        }
        .receipt-note {
          font-size: 0.6875rem;
          color: #999;
          margin-top: 0.75rem !important;
          font-style: italic;
        }
      `}</style>
    </>
  );
}
