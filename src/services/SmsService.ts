import * as SMS from 'expo-sms';
import { Contact } from '../types';

export const buildEmergencyMessage = (mapsLink: string): string => {
  return [
    '🚨 EMERGENCY ALERT!',
    'I need immediate help.',
    '',
    'My live location:',
    mapsLink,
  ].join('\n');
};

export const SmsService = {
  async sendEmergencySms(
    contacts: Contact[],
    mapsLink: string
  ): Promise<boolean> {
    const emergencyContacts = contacts.filter((c) => c.isEmergency);
    if (emergencyContacts.length === 0) {
      throw new Error(
        'Add at least one favourite emergency contact before using SOS.'
      );
    }

    const phoneNumbers = emergencyContacts.map((c) => c.phone);
    const message = buildEmergencyMessage(mapsLink);

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('SMS is not available on this device.');
      }

      const result = await SMS.sendSMSAsync(phoneNumbers, message);
      console.log('[SMS Service] SMS result', result);

      if (result.result === 'sent') {
        return true;
      }

      throw new Error('SMS sending was cancelled or failed.');
    } catch (err) {
      console.error('[SMS Service] Failed to send emergency SMS', err);
      throw err;
    }
  },
};


