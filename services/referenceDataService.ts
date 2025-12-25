
import { ReferenceDataConfig } from '../utils/referenceDataConfig';

export interface StoneShape {
  id: string;
  shapeName: string;
  abbreviation?: string;
  description?: string;
  commonFor?: string[];
}

export interface NoteItem {
    id: string;
    category: string;
    amount?: number;
    currency?: string;
    notes?: string;
    date?: string;
}

export const getReferenceData = async (config: ReferenceDataConfig): Promise<{ shapes: StoneShape[], notes: NoteItem[] }> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (config.referenceType === 'important_notes') {
    return {
      shapes: [],
      notes: [
        { id: 'n1', category: 'Tanzania', amount: 1436000, currency: 'TZS', notes: 'Capital injection' },
        { id: 'n2', category: 'Tanzania', amount: 810000, currency: 'TZS', notes: 'Operational costs' },
        { id: 'n3', category: 'Sri Lanka', amount: 259800, currency: 'LKR', notes: 'Local office expenses' },
        { id: 'n4', category: 'Sri Lanka', amount: 0, currency: 'LKR', notes: 'Pending confirmation from Azeem' }
      ]
    };
  }

  // Type A returns empty by default as per requirements, but could return saved shapes later
  return { shapes: [], notes: [] };
};
