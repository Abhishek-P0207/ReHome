/**
 * Mock Service Helpers: Simulated Latency & Error Injection.
 * Strictly adheres to Section 2:
 * "Every service function is async, resolves after a simulated 300 to 900 ms delay,
 * and can throw a typed AppError. Failures only happen when the Demo Controls toggle
 * Simulate errors is on."
 */
import { useDemoStore } from '@/store/demoStore';
import { AppError } from '@/types';

function getRandomDelay(min = 300, max = 900): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function simulateLatency(customDelay?: number): Promise<void> {
  const { simulateErrors, slowNetwork } = useDemoStore.getState();

  let delay = customDelay ?? getRandomDelay(300, 900);
  if (slowNetwork) {
    delay *= 2;
  }

  await new Promise((resolve) => setTimeout(resolve, delay));

  if (simulateErrors) {
    throw new AppError(
      'NETWORK',
      'Simulated network failure. Toggle "Simulate errors" in Demo Controls to restore normal responses.',
    );
  }
}
