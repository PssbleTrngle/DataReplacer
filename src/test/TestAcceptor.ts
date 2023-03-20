import { Acceptor } from '@pssbletrngle/pack-resolver'

export interface TestAcceptor extends Acceptor {
   at(path: string): string | null
   expect(path: string, content: string | Record<string, unknown>): void
}

export default function createTestAcceptor(): TestAcceptor {
   const received = new Map<string, string>()
   const acceptor: TestAcceptor = (path, content) => {
      received.set(path, content.toString())
      return true
   }

   acceptor.at = path => received.get(path) ?? null
   acceptor.expect = (path, expected) => {
      const raw = acceptor.at(path)
      expect(raw).not.toBeNull()

      if (typeof expected === 'string') {
         expect(raw).toBe(expected)
      } else {
         expect(JSON.parse(raw!)).toStrictEqual(expected)
      }
   }

   return acceptor
}
