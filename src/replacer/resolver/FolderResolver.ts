import { readFileSync } from 'fs'
import { join } from 'path'
import { listChildren } from '../../util.js'
import IResolver, { Acceptor } from './IResolver.js'

export default class FolderResolver implements IResolver {
   constructor(private readonly folder: string) {}

   private recursiveExtract(acceptor: Acceptor, path = '.') {
      const children = listChildren(join(this.folder, path))

      const files = children.filter(it => it.info.isFile())
      files.forEach(it => acceptor(join(path, it.name), readFileSync(it.path)))

      const folders = children.filter(it => it.info.isDirectory())
      folders.forEach(it => this.recursiveExtract(acceptor, join(path, it.name)))
   }

   async extract(acceptor: Acceptor) {
      return this.recursiveExtract(acceptor)
   }
}
