import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Notification, NotificationType } from './types';

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    link?: string
) {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            message,
            type,
            read: false,
            link: link || null,
            createdAt: new Date(),
        });
    } catch (err) {
        console.error('Error creating notification:', err);
    }
}

export async function markAsRead(notificationId: string) {
    try {
        await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
        console.error('Error marking notification as read:', err);
    }
}

export async function markAllAsRead(userId: string) {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const snap = await getDocs(q);
        const promises = snap.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true }));
        await Promise.all(promises);
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
}

// Notify worker when assigned to a job
export async function notifyWorkerAssigned(workerId: string, workerName: string, jobType: string, location: string, jobId: string) {
    await createNotification(
        workerId,
        'New Job Assignment',
        `You've been assigned to a ${jobType} job in ${location}.`,
        'ASSIGNMENT',
        `/dashboard/worker`
    );
}

// Notify customer when job status changes
export async function notifyJobStatusChange(customerId: string, jobType: string, newStatus: string, jobId: string) {
    const statusMessages: Record<string, string> = {
        CONFIRMED: `Your ${jobType} request has been confirmed! We're assembling your team.`,
        IN_PROGRESS: `Work has started on your ${jobType} project. Workers are on site.`,
        COMPLETED: `Your ${jobType} job has been marked as completed. Thank you for using NeedLabour!`,
        CANCELLED: `Your ${jobType} request has been cancelled. Contact us for questions.`,
    };

    const message = statusMessages[newStatus] || `Status updated to ${newStatus}.`;

    await createNotification(
        customerId,
        `Job ${newStatus.replace('_', ' ')}`,
        message,
        'STATUS_UPDATE',
        `/dashboard/customer`
    );
}

// Notify customer when payment is recorded
export async function notifyPaymentRecorded(customerId: string, amount: number, paymentType: string, jobId: string) {
    if (paymentType === 'CUSTOMER_PAYMENT') {
        await createNotification(
            customerId,
            'Payment Recorded',
            `Your payment of ₹${amount.toLocaleString()} has been received. Thank you!`,
            'PAYMENT',
            `/dashboard/customer`
        );
    }
}
