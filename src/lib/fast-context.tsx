import React, { createContext, useState, useContext, useCallback, useRef } from 'react'

/**
 * Ultra-fast context for instant state updates
 * Uses refs for synchronous state access
 * Minimal re-renders with selective updates
 */

interface FastContextValue<T> {
  state: T;
  setState: (value: T | ((prev: T) => T)) => void;
  getState: () => T;
}

export function createFastContext<T>(initialValue: T) {
  const Context = createContext<FastContextValue<T> | undefined>(undefined);

  function FastProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState(initialValue);
    const stateRef = useRef(initialValue);

    const setFastState = useCallback((value: T | ((prev: T) => T)) => {
      setState(prevState => {
        const newValue = typeof value === 'function' ? (value as Function)(prevState) : value;
        stateRef.current = newValue;
        return newValue;
      });
    }, []);

    const getState = useCallback(() => stateRef.current, []);

    const value: FastContextValue<T> = {
      state,
      setState: setFastState,
      getState,
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useFastContext() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useFastContext must be used within FastProvider');
    }
    return context;
  }

  return { FastProvider, useFastContext, Context };
}

/**
 * Batch update utility for instant multiple state changes
 */
export function useBatchUpdate<T>(setState: (value: T) => void) {
  const batchRef = useRef<Array<(prev: T) => T>>([]);

  const addUpdate = useCallback((update: (prev: T) => T) => {
    batchRef.current.push(update);
  }, []);

  const flush = useCallback((currentState: T) => {
    if (batchRef.current.length === 0) return currentState;

    let newState = currentState;
    batchRef.current.forEach(update => {
      newState = update(newState);
    });
    batchRef.current = [];
    setState(newState);
    return newState;
  }, [setState]);

  return { addUpdate, flush } as const;
}
