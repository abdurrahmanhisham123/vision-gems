import { CutPolishExpenseItem } from '../components/templates/CutPolishExpensesTemplate';
import { CutPolishRecord, ExtendedSpinelStone } from '../types';
import { getExportedStones, saveExportedStone } from './dataService';

/**
 * Converts a CutPolishExpenseItem to a CutPolishRecord
 */
export const convertExpenseItemToRecord = (item: CutPolishExpenseItem): CutPolishRecord => {
  // Map type: 'Cutting' | 'Polishing' to 'cut' | 'polish'
  let recordType: 'cut' | 'polish' | 'both' = 'cut';
  if (item.type === 'Polishing') {
    recordType = 'polish';
  } else if (item.type === 'Cutting') {
    recordType = 'cut';
  }
  // Note: 'both' would need to be determined from context or additional field

  return {
    id: item.id, // Use the same ID to track the record
    worker: item.name || '',
    type: recordType,
    description: item.description || '',
    amount: item.amount || 0,
    paymentMethod: item.paymentMethod || 'Cash'
  };
};

/**
 * Syncs a cut & polish record to all stones with matching code
 * Returns the number of stones updated and whether any stone was found
 */
export const syncCutPolishRecordToStones = (
  code: string,
  record: CutPolishRecord,
  oldCode?: string
): { updated: number; notFound: boolean } => {
  if (!code || code.trim() === '') {
    return { updated: 0, notFound: false };
  }

  const allStones = getExportedStones();
  const normalizedCode = code.trim().toUpperCase();
  
  // If code changed, remove from old stone(s) first
  if (oldCode && oldCode.trim() !== '' && oldCode.trim().toUpperCase() !== normalizedCode) {
    const oldNormalizedCode = oldCode.trim().toUpperCase();
    allStones.forEach(stone => {
      if (stone.codeNo?.toUpperCase() === oldNormalizedCode) {
        if (stone.cutPolishRecords && stone.cutPolishRecords.length > 0) {
          stone.cutPolishRecords = stone.cutPolishRecords.filter(r => r.id !== record.id);
          saveExportedStone(stone);
        }
      }
    });
  }

  // Find all stones with matching code
  const matchingStones = allStones.filter(
    stone => stone.codeNo?.toUpperCase() === normalizedCode
  );

  if (matchingStones.length === 0) {
    return { updated: 0, notFound: true };
  }

  // Update each matching stone
  let updatedCount = 0;
  matchingStones.forEach(stone => {
    // Initialize cutPolishRecords array if it doesn't exist
    if (!stone.cutPolishRecords) {
      stone.cutPolishRecords = [];
    }

    // Check if record with same id already exists
    const existingIndex = stone.cutPolishRecords.findIndex(r => r.id === record.id);
    
    if (existingIndex > -1) {
      // Update existing record
      stone.cutPolishRecords[existingIndex] = record;
    } else {
      // Add new record
      stone.cutPolishRecords.push(record);
    }

    // Save updated stone
    saveExportedStone(stone);
    updatedCount++;
  });

  return { updated: updatedCount, notFound: false };
};

/**
 * Removes a cut & polish record from all stones with matching code
 */
export const removeCutPolishRecordFromStones = (
  code: string,
  recordId: string
): { updated: number; notFound: boolean } => {
  if (!code || code.trim() === '') {
    return { updated: 0, notFound: false };
  }

  const allStones = getExportedStones();
  const normalizedCode = code.trim().toUpperCase();
  
  // Find all stones with matching code
  const matchingStones = allStones.filter(
    stone => stone.codeNo?.toUpperCase() === normalizedCode
  );

  if (matchingStones.length === 0) {
    return { updated: 0, notFound: true };
  }

  // Remove record from each matching stone
  let updatedCount = 0;
  matchingStones.forEach(stone => {
    if (stone.cutPolishRecords && stone.cutPolishRecords.length > 0) {
      const initialLength = stone.cutPolishRecords.length;
      stone.cutPolishRecords = stone.cutPolishRecords.filter(r => r.id !== recordId);
      
      // Only save if a record was actually removed
      if (stone.cutPolishRecords.length < initialLength) {
        saveExportedStone(stone);
        updatedCount++;
      }
    }
  });

  return { updated: updatedCount, notFound: false };
};
