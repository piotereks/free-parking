import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  clearLocalStorage
} from '../src/utils/storageUtils';

describe('storageUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getLocalStorage', () => {
    it('retrieves and parses stored value', () => {
      localStorage.setItem('test-key', JSON.stringify({ foo: 'bar' }));
      const result = getLocalStorage('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('returns default value for non-existent key', () => {
      const result = getLocalStorage('non-existent', 'default');
      expect(result).toBe('default');
    });

    it('returns null as default when not specified', () => {
      const result = getLocalStorage('non-existent');
      expect(result).toBeNull();
    });

    it('handles string values', () => {
      localStorage.setItem('test-key', JSON.stringify('string value'));
      const result = getLocalStorage('test-key');
      expect(result).toBe('string value');
    });

    it('handles number values', () => {
      localStorage.setItem('test-key', JSON.stringify(42));
      const result = getLocalStorage('test-key');
      expect(result).toBe(42);
    });

    it('handles boolean values', () => {
      localStorage.setItem('test-key', JSON.stringify(true));
      const result = getLocalStorage('test-key');
      expect(result).toBe(true);
    });

    it('handles array values', () => {
      localStorage.setItem('test-key', JSON.stringify([1, 2, 3]));
      const result = getLocalStorage('test-key');
      expect(result).toEqual([1, 2, 3]);
    });

    it('returns default value on parse error', () => {
      localStorage.setItem('test-key', 'invalid-json{');
      const result = getLocalStorage('test-key', 'fallback');
      expect(result).toBe('fallback');
    });

    it('handles empty string as stored value', () => {
      localStorage.setItem('test-key', '');
      const result = getLocalStorage('test-key', 'default');
      expect(result).toBe('default');
    });
  });

  describe('setLocalStorage', () => {
    it('stores value as JSON string', () => {
      const result = setLocalStorage('test-key', { foo: 'bar' });
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('{"foo":"bar"}');
    });

    it('stores string value', () => {
      const result = setLocalStorage('test-key', 'test value');
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('"test value"');
    });

    it('stores number value', () => {
      const result = setLocalStorage('test-key', 42);
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('42');
    });

    it('stores boolean value', () => {
      const result = setLocalStorage('test-key', false);
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('false');
    });

    it('stores array value', () => {
      const result = setLocalStorage('test-key', [1, 2, 3]);
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('[1,2,3]');
    });

    it('stores null value', () => {
      const result = setLocalStorage('test-key', null);
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('null');
    });

    it('overwrites existing value', () => {
      setLocalStorage('test-key', 'old');
      setLocalStorage('test-key', 'new');
      expect(getLocalStorage('test-key')).toBe('new');
    });

    it('handles complex nested objects', () => {
      const complex = {
        nested: { deeply: { value: 123 } },
        array: [{ id: 1 }, { id: 2 }]
      };
      setLocalStorage('test-key', complex);
      expect(getLocalStorage('test-key')).toEqual(complex);
    });
  });

  describe('removeLocalStorage', () => {
    it('removes existing key', () => {
      localStorage.setItem('test-key', 'value');
      const result = removeLocalStorage('test-key');
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('returns true even for non-existent key', () => {
      const result = removeLocalStorage('non-existent');
      expect(result).toBe(true);
    });

    it('does not affect other keys', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      removeLocalStorage('key1');
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBe('value2');
    });
  });

  describe('clearLocalStorage', () => {
    it('clears all localStorage items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');
      
      const result = clearLocalStorage();
      expect(result).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('returns true for already empty localStorage', () => {
      const result = clearLocalStorage();
      expect(result).toBe(true);
    });
  });

  describe('error handling', () => {
    it('getLocalStorage handles localStorage errors gracefully', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem');
      spy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getLocalStorage('test-key', 'fallback');
      expect(result).toBe('fallback');

      spy.mockRestore();
    });

    it('setLocalStorage returns false on error', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem');
      spy.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = setLocalStorage('test-key', 'value');
      expect(result).toBe(false);

      spy.mockRestore();
    });

    it('removeLocalStorage returns false on error', () => {
      const spy = vi.spyOn(Storage.prototype, 'removeItem');
      spy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = removeLocalStorage('test-key');
      expect(result).toBe(false);

      spy.mockRestore();
    });

    it('clearLocalStorage returns false on error', () => {
      const spy = vi.spyOn(Storage.prototype, 'clear');
      spy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = clearLocalStorage();
      expect(result).toBe(false);

      spy.mockRestore();
    });
  });
});
