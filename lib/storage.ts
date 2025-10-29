import { Customer, Appointment } from '@/types';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export const StorageService = {
  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },
  
  async addCustomer(customer: Customer): Promise<void> {
    try {
      const customersRef = collection(db, 'customers');
      await addDoc(customersRef, customer);
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },
  
  async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      const customerRef = doc(db, 'customers', id);
      const customerSnap = await getDoc(customerRef);
      if (customerSnap.exists()) {
        return { id: customerSnap.id, ...customerSnap.data() } as Customer;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return undefined;
    }
  },

  async getCustomerByName(name: string): Promise<Customer | undefined> {
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('name', '==', name));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Customer;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching customer by name:', error);
      return undefined;
    }
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    try {
      const customerRef = doc(db, 'customers', id);
      await updateDoc(customerRef, customer);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
  
  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(db, 'appointments');
      // Nur nach Datum sortieren (vereinfacht, um Index zu vermeiden)
      const q = query(appointmentsRef, orderBy('date'));
      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      // In-Memory nach Zeit sortieren
      return appointments.sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeA.localeCompare(dateTimeB);
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },
  
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, where('date', '==', date));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return [];
    }
  },
  
  async addAppointment(appointment: Appointment): Promise<void> {
    try {
      const appointmentsRef = collection(db, 'appointments');
      await addDoc(appointmentsRef, appointment);
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  },
  
  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
    try {
      const appointmentRef = doc(db, 'appointments', id);
      await updateDoc(appointmentRef, appointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },
  
  async deleteAppointment(id: string): Promise<void> {
    try {
      const appointmentRef = doc(db, 'appointments', id);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },
  
  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      const now = new Date();
      const appointments = await this.getAppointments();
      return appointments.filter(a => {
        const appointmentDate = new Date(`${a.date}T${a.time}`);
        return appointmentDate > now;
      }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  }
};
