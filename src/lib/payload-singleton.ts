import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'

let cachedPayload: Payload | null = null

/**
 * Get a cached Payload instance to avoid reinitializing on every request.
 * This singleton pattern ensures Payload is initialized only once and reused across requests.
 * 
 * @returns Promise<Payload> - The cached Payload instance
 */
export async function getCachedPayload(): Promise<Payload> {
  if (cachedPayload) {
    return cachedPayload
  }

  // Initialize Payload only once
  cachedPayload = await getPayload({ config })

  return cachedPayload
}

/**
 * Reset the cached Payload instance (useful for testing or HMR)
 */
export function resetPayloadCache(): void {
  cachedPayload = null
}
