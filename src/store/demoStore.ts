/**
 * Demo Controls State Store.
 * Controls demo persona, AI scenario, error simulation, auto-respond, and network latency.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AiScenario = 'auto' | 'high' | 'medium' | 'low' | 'flagged';

interface DemoStoreState {
  currentPersonaId: string;
  aiScenario: AiScenario;
  autoRespond: boolean;
  simulateErrors: boolean;
  slowNetwork: boolean;

  // Actions
  setPersonaId: (id: string) => void;
  setAiScenario: (scenario: AiScenario) => void;
  setAutoRespond: (enabled: boolean) => void;
  setSimulateErrors: (enabled: boolean) => void;
  setSlowNetwork: (enabled: boolean) => void;
  resetDemoControls: () => void;
}

const DEFAULT_STATE = {
  currentPersonaId: 'user-ravi',
  aiScenario: 'auto' as AiScenario,
  autoRespond: true,
  simulateErrors: false,
  slowNetwork: false,
};

export const useDemoStore = create<DemoStoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setPersonaId: (id) => set({ currentPersonaId: id }),
      setAiScenario: (scenario) => set({ aiScenario: scenario }),
      setAutoRespond: (enabled) => set({ autoRespond: enabled }),
      setSimulateErrors: (enabled) => set({ simulateErrors: enabled }),
      setSlowNetwork: (enabled) => set({ slowNetwork: enabled }),
      resetDemoControls: () => set(DEFAULT_STATE),
    }),
    {
      name: 'rehome_demo_controls',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
