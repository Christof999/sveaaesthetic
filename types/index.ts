export interface Customer {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  comment: string;
  imageUrl?: string;
}
