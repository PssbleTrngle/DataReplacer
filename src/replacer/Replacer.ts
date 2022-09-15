import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver/dist'
import chalk from 'chalk'
import { readFileSync, writeFileSync } from 'fs'
import { emptyDirSync, ensureDirSync } from 'fs-extra'
import minimatch from 'minimatch'
import { dirname, join, resolve } from 'path'
import { zip } from 'zip-a-folder'
import { fileHash } from '../util.js'
import { MergeOptions } from './options.js'

interface ReplaceEntry {
   matches(path: string): boolean
   search: string
   replacement: string
}

interface Filter {
   mod: string
}

export default class Replacer {
   private entries: ReplaceEntry[] = []

   constructor(private readonly options: MergeOptions) {}

   public replace(pattern: string, search: string, replacement: string) {
      this.entries.push({ matches: it => minimatch(it, pattern), search, replacement })
   }

   public replaceLootItem(search: string, replacement: string, filter: Filter = { mod: '*' }) {
      this.replace(`data/${filter.mod}/loot_tables/**/*.json`, search, replacement)
   }

   public createAcceptor(outDir: string): Acceptor {
      return (path, content) => {
         const input = content.toString()

         const matching = this.entries.filter(it => it.matches(path) && input.includes(it.search))

         if (matching.length) {
            console.log(`Found ${matching.length} matches for ${chalk.underline(path)}`)

            const replaced = matching.reduce((current, entry) => {
               return current.replace(entry.search, entry.replacement)
            }, input)

            const out = join(outDir, path)
            ensureDirSync(dirname(out))

            writeFileSync(out, replaced)
         }
      }
   }

   public async run(resolvers: { resolver: IResolver; name: string }[]) {
      const outDir = this.options.zipOutput ? resolve('tmp') : this.options.output
      emptyDirSync(outDir)

      const acceptor = this.createAcceptor(outDir)

      console.group('Replacing resources...')
      await Promise.all(
         resolvers.map(async ({ resolver, name }) => {
            console.log(name)
            await resolver.extract(acceptor)
         })
      )
      console.groupEnd()

      if (this.options.zipOutput) {
         console.log('Creating ZIP File...')
         await zip(outDir, this.options.output)

         const hash = fileHash(readFileSync(this.options.output), 'sha1')
         console.log(`SHA256: ${hash}`)
      }
   }
}
