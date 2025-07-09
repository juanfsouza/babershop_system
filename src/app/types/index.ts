export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'CLIENT' | 'ADMIN'; 
}

export interface Appointment {
    id: number;
    userId: number;
    serviceId: number;
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface Service {
    id: number;
    name: string;
    price: number;
    duration: number;
}

export interface Schedule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SliderImage {
  id: number;
  url: string;
  altText?: string;
}