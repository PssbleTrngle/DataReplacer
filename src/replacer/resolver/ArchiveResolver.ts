import StreamZip from 'node-stream-zip'
import IResolver, { Acceptor } from './IResolver.js'

export default class ArchiveResolver implements IResolver {
   constructor(private readonly archive: string) {}

   async extract(acceptor: Acceptor) {
      const zip = new StreamZip.async({ file: this.archive })
      const entries = await zip.entries()

      await Promise.all(
         Object.values(entries).map(async entry => {
            if (entry.isFile) {
               acceptor(entry.name, await zip.entryData(entry))
            }
         })
      )

      await zip.close()
   }
}
