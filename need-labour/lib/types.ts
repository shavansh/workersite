export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';

export interface UserData {
    uid: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    createdAt: Date;
}

export interface WorkerProfile {
    userId: string;
    skills: string[];
    experience: number;
    dailyWage: number;
    availability: boolean;
    location: string;
    languages: string[];
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    idDocumentUrl?: string;
    bio?: string;
}

export type JobStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface JobRequest {
    id?: string;
    customerId: string;
    customerName?: string;
    customerPhone?: string;
    description: string;
    labourType: string;
    quantity: number;
    location: string;
    preferredStartDate: string;
    duration?: number;
    wageModel?: 'DAILY' | 'THEKA';
    agreedWage?: number;
    status: JobStatus;
    totalCost?: number;
    adminNotes?: string;
    createdAt: Date;
}

export type AssignmentStatus = 'ASSIGNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Assignment {
    id?: string;
    jobRequestId: string;
    workerId: string;
    workerName?: string;
    daysAssigned: number;
    baseWagePerDay: number;
    markupPerDay: number;
    totalCost: number;
    status: AssignmentStatus;
}

export type PaymentType = 'CUSTOMER_PAYMENT' | 'WORKER_PAYOUT';

export interface Transaction {
    id?: string;
    jobRequestId: string;
    amount: number;
    paymentType: PaymentType;
    method: string;
    date: Date;
    notes?: string;
}

export const LABOUR_TYPES = [
    'Mason',
    'Carpenter',
    'Electrician',
    'Plumber',
    'Painter',
    'Tile Worker',
    'Steel Fixer',
    'Helper / Labourer',
    'Welder',
    'AC Technician',
    'RCC Worker',
    'Shuttering Worker',
] as const;

export const SKILLS = [...LABOUR_TYPES];

export const LANGUAGES = [
    'Hindi',
    'Urdu',
    'Dogri',
    'Punjabi',
    'English',
    'Kashmiri',
] as const;

export const LOCATIONS = [
    'Jammu City',
    'Katra',
    'Udhampur',
    'Samba',
    'Kathua',
    'Rajouri',
    'Poonch',
    'Reasi',
    'Doda',
    'Kishtwar',
] as const;
