import crypto from 'crypto'

export function fileHash(content: Buffer, type = 'sha256') {
   return crypto.createHash(type).update(content).digest('hex')
}
