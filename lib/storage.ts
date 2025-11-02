import { Customer, Appointment } from '@/types';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// In-Memory Fallback Storage (für Entwicklung, wenn Firebase nicht konfiguriert ist)
let inMemoryCustomers: Customer[] = [];
let inMemoryAppointments: Appointment[] = [];

const useFirebase = db !== null;

export const StorageService = {
  // Customers
  async getCustomers(): Promise<Customer[]> {
    if (!useFirebase) {
      return inMemoryCustomers;
    }
    
    try {
      const customersRef = collection(db!, 'customers');
      const snapshot = await getDocs(customersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Fallback auf In-Memory, falls Firebase-Fehler auftreten
      return inMemoryCustomers;
    }
  },
  
  async addCustomer(customer: Customer): Promise<void> {
    if (!useFirebase) {
      // In-Memory Fallback
      const newCustomer: Customer = {
        ...customer,
        id: customer.id || `temp-${Date.now()}-${Math.random()}`
      };
      inMemoryCustomers.push(newCustomer);
      return;
    }
    
    try {
      const customersRef = collection(db!, 'customers');
      // Entferne undefined Felder und id (Firebase generiert die ID automatisch)
      const customerData: any = {
        name: customer.name,
      };
      if (customer.email) customerData.email = customer.email;
      if (customer.phone) customerData.phone = customer.phone;
      
      await addDoc(customersRef, customerData);
    } catch (error) {
      console.error('Error adding customer:', error);
      // Fallback auf In-Memory
      const newCustomer: Customer = {
        ...customer,
        id: customer.id || `temp-${Date.now()}-${Math.random()}`
      };
      inMemoryCustomers.push(newCustomer);
      throw error; // Fehler weiterwerfen damit API das erkennen kann
    }
  },
  
  async getCustomerById(id: string): Promise<Customer | undefined> {
    if (!useFirebase) {
      return inMemoryCustomers.find(c => c.id === id);
    }
    
    try {
      const customerRef = doc(db!, 'customers', id);
      const customerSnap = await getDoc(customerRef);
      if (customerSnap.exists()) {
        return { id: customerSnap.id, ...customerSnap.data() } as Customer;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return inMemoryCustomers.find(c => c.id === id);
    }
  },

  async getCustomerByName(name: string): Promise<Customer | undefined> {
    if (!useFirebase) {
      return inMemoryCustomers.find(c => c.name === name);
    }
    
    try {
      const customersRef = collection(db!, 'customers');
      const q = query(customersRef, where('name', '==', name));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Customer;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching customer by name:', error);
      return inMemoryCustomers.find(c => c.name === name);
    }
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    if (!useFirebase) {
      const index = inMemoryCustomers.findIndex(c => c.id === id);
      if (index !== -1) {
        inMemoryCustomers[index] = { ...inMemoryCustomers[index], ...customer };
      }
      return;
    }
    
    try {
      const customerRef = doc(db!, 'customers', id);
      // Entferne undefined Felder und id (wird nicht aktualisiert)
      const updateData: any = {};
      if (customer.name !== undefined) updateData.name = customer.name;
      if (customer.email !== undefined) updateData.email = customer.email;
      if (customer.phone !== undefined) updateData.phone = customer.phone;
      
      await updateDoc(customerRef, updateData);
    } catch (error) {
      console.error('Error updating customer:', error);
      // Fallback auf In-Memory
      const index = inMemoryCustomers.findIndex(c => c.id === id);
      if (index !== -1) {
        inMemoryCustomers[index] = { ...inMemoryCustomers[index], ...customer };
      }
      throw error; // Fehler weiterwerfen damit API das erkennen kann
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    if (!useFirebase) {
      inMemoryCustomers = inMemoryCustomers.filter(c => c.id !== id);
      return;
    }
    
    try {
      const customerRef = doc(db!, 'customers', id);
      await deleteDoc(customerRef);
    } catch (error) {
      console.error('Error deleting customer:', error);
      // Fallback auf In-Memory
      inMemoryCustomers = inMemoryCustomers.filter(c => c.id !== id);
      throw error;
    }
  },
  
  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    if (!useFirebase) {
      return [...inMemoryAppointments].sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeA.localeCompare(dateTimeB);
      });
    }
    
    try {
      const appointmentsRef = collection(db!, 'appointments');
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
      // Fallback auf In-Memory
      return [...inMemoryAppointments].sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeA.localeCompare(dateTimeB);
      });
    }
  },
  
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    if (!useFirebase) {
      return inMemoryAppointments.filter(a => a.date === date);
    }
    
    try {
      const appointmentsRef = collection(db!, 'appointments');
      const q = query(appointmentsRef, where('date', '==', date));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return inMemoryAppointments.filter(a => a.date === date);
    }
  },
  
  async addAppointment(appointment: Appointment): Promise<void> {
    if (!useFirebase) {
      // In-Memory Fallback
      const newAppointment: Appointment = {
        ...appointment,
        id: appointment.id || `temp-${Date.now()}-${Math.random()}`
      };
      inMemoryAppointments.push(newAppointment);
      return;
    }
    
    try {
      const appointmentsRef = collection(db!, 'appointments');
      await addDoc(appointmentsRef, appointment);
    } catch (error) {
      console.error('Error adding appointment:', error);
      // Fallback auf In-Memory
      const newAppointment: Appointment = {
        ...appointment,
        id: appointment.id || `temp-${Date.now()}-${Math.random()}`
      };
      inMemoryAppointments.push(newAppointment);
    }
  },
  
  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
    if (!useFirebase) {
      const index = inMemoryAppointments.findIndex(a => a.id === id);
      if (index !== -1) {
        inMemoryAppointments[index] = { ...inMemoryAppointments[index], ...appointment };
      }
      return;
    }
    
    try {
      const appointmentRef = doc(db!, 'appointments', id);
      await updateDoc(appointmentRef, appointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      // Fallback auf In-Memory
      const index = inMemoryAppointments.findIndex(a => a.id === id);
      if (index !== -1) {
        inMemoryAppointments[index] = { ...inMemoryAppointments[index], ...appointment };
      }
    }
  },
  
  async deleteAppointment(id: string): Promise<void> {
    if (!useFirebase) {
      inMemoryAppointments = inMemoryAppointments.filter(a => a.id !== id);
      return;
    }
    
    try {
      const appointmentRef = doc(db!, 'appointments', id);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      // Fallback auf In-Memory
      inMemoryAppointments = inMemoryAppointments.filter(a => a.id !== id);
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
