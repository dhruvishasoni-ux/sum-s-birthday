// =====================================================
// IN-MEMORY SESSION STORAGE & ONE-TIME CLEANUP
// User-created content is NOT permanently stored.
// Everything lives in runtime React state and disappears on refresh.
// =====================================================

export const DEFAULT_ACCENT_COLOR = '#B89CFF';

// Programmer-defined Central Birthday Message (read-only)
export const PROGRAMMER_CENTRAL_MESSAGE = {
  text: 'text undecided'
};

// One-time cleanup to remove any old stored data from previous versions
export function clearOldPersistentData(): void {
  try {
    const keysToRemove = [
      'birthday_sky_wishes',
      'birthday_sky_stories',
      'birthday_sky_personality',
      'birthday_sky_voice_notes',
      'birthday_sky_secret_stars',
      'birthday_sky_moon_message',
      'birthday_sky_accent_color',
      'birthday_sky_profile'
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Also delete old IndexedDB if it exists
    if (window.indexedDB && window.indexedDB.deleteDatabase) {
      window.indexedDB.deleteDatabase('BirthdaySkyDB');
    }
  } catch (err) {
    console.warn('Could not clear old storage keys', err);
  }
}

// Run cleanup immediately on script load
clearOldPersistentData();
