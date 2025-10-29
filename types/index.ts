export interface Customer {
  id: string;
  name: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  comment: string;
  imageUrl?: string;
  status: AppointmentStatus;
  createdAt: string; // ISO timestamp
  seenByAdmin?: boolean; // Ob Admin den Termin bereits gesehen hat
  confirmedByCustomer?: boolean; // Ob Kundin bestätigt hat
}
