
export interface Doctor {
    id: string;
    name: string;
    image: string;
    specialty: string;
    rating: number;
    reviews: number;
    price: number;
    about?: string;
    experience?: number;
    location?: string;
}

export interface PatientDetails {
    name: string;
    phone: string;
    address: string;
    age: string;
}

export interface Booking {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorImage: string;
    doctorSpecialty: string;
    userId: string;
    patientName: string;
    patientPhone: string;
    patientAddress: string;
    patientAge: string;
    appointmentDate: string; // ISO string
    appointmentTime?: string;
    paymentMethod: 'cash' | 'online';
    fee: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    createdAt: string; // ISO string
}

export interface Service {
    title: string;
    description: string;
    href: string;
    imgSrc: string;
    imgHint?: string;
}

export interface SiteSettings {
    general: {
        siteName: string;
        description: string;
        logoUrl?: string;
    };
    contact: {
        whatsapp: string;
        phone: string;
        email: string;
        facebookUrl?: string;
        instagramUrl?: string;
        location: string;
    };
    theme: {
        primaryColor: string;
        accentColor: string;
    };
    hero: {
        title: string;
        subtitle: string;
        imageUrl?: string;
    }; // Fixed missing semicolon here in previous version
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: any; // Firestore Timestamp
    link?: string; // Optional link to navigate to
}

export interface ServicePackage {
    id: string;
    title: string;
    description: string;
    price: number;
    image?: string;
    features?: string[]; // List of features/inclusions
    category: 'physiotherapy' | 'nursing' | 'lab' | 'surgery' | 'home-visit';
    createdAt: any;
}
