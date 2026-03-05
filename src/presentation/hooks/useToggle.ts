import { useState, useCallback } from 'react';

/**
 * Hook compartido para manejar estados booleanos toggle.
 * Elimina duplicacion del patron useCallback(() => setState(prev => !prev), []).
 */
export const useToggle = (initialValue = false): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const set = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, set];
};
