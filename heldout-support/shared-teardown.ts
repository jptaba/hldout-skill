/**
 * Runs once when a run is over (playwright.config.ts → globalTeardown): removes what the tests shared through
 * seed.shared. Each parallel worker made its records once and kept them through the restarts that follow failed
 * tests, so they are removed here and not when a worker ends.
 */
import { removeSharedData } from './fixtures';

export default async function sharedTeardown(): Promise<void> {
  await removeSharedData();
}
