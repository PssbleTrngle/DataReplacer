import crypto from 'crypto'
import { readdirSync, statSync } from 'fs'
import lodash from 'lodash'
import { join } from 'path'

export function exists<T>(value?: T | null): value is T {
   return (value ?? null) !== null
}

export function listChildren(dir: string) {
   const unsorted = readdirSync(dir).map(name => {
      const path = join(dir, name)
      const info = statSync(path)
      return { name, path, info }
   })
   return lodash.orderBy(unsorted, it => it.name)
}

export function fileHash(content: Buffer, type = 'sha256') {
   return crypto.createHash(type).update(content).digest('hex')
}
