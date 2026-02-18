import * as SecureStore from 'expo-secure-store';
import { Contact } from '../types';

const CONTACTS_STORAGE_KEY = 'guardia_contacts_v1';

export const normalizePhone = (phone: string): string =>
  phone.replace(/[\s\-]/g, '');

export const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  // Basic international format validation: + optional, 7–15 digits
  return /^\+?[0-9]{7,15}$/.test(normalized);
};

export const ContactService = {
  async loadContacts(): Promise<Contact[]> {
    try {
      const raw = await SecureStore.getItemAsync(CONTACTS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Contact[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      console.error('[ContactService] Failed to load contacts', err);
      return [];
    }
  },

  async saveContacts(contacts: Contact[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        CONTACTS_STORAGE_KEY,
        JSON.stringify(contacts)
      );
    } catch (err) {
      console.error('[ContactService] Failed to save contacts', err);
    }
  },

  hasDuplicatePhone(contacts: Contact[], phone: string): boolean {
    const target = normalizePhone(phone);
    return contacts.some((c) => normalizePhone(c.phone) === target);
  },
};


