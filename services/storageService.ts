
/**
 * Generic Storage Service for Piggybanko
 * Abstrae el acceso a la persistencia para permitir cambios futuros a IndexedDB o API REST.
 */
export class StorageService {
  static save(key: string, data: any): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(`piggy_${key}`, serializedData);
    } catch (error) {
      console.error(`Error saving to storage [${key}]:`, error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`piggy_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading from storage [${key}]:`, error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(`piggy_${key}`);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('piggy_')) localStorage.removeItem(key);
    });
  }
}
