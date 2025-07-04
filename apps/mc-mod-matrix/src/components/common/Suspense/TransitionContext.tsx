'use client';

import { createContext, useContext, useMemo, useTransition } from 'react';

import type { TransitionStartFunction } from 'react';

//================================================

type UseTransitionState = { isPending: boolean; startTransition: TransitionStartFunction };

export const UseTransitionContext = createContext<UseTransitionState>({
  isPending: false,
  startTransition: (action: () => void) => action(),
});

export const UseTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPending, startTransition] = useTransition();

  const value = useMemo(() => ({ isPending, startTransition }), [isPending]);

  return <UseTransitionContext.Provider value={value}>{children}</UseTransitionContext.Provider>;
};

export const useTransitionContext = () => useContext(UseTransitionContext);
