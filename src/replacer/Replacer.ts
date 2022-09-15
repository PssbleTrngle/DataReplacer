import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver'
import { createDefaultMerger, Merger } from '@pssbletrngle/resource-merger'
import chalk from 'chalk'
import { emptyDirSync } from 'fs-extra'
import minimatch from 'minimatch'
import { resolve } from 'path'
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

   public createAcceptor(merger: Merger): Acceptor {
      const mergeAcceptor = merger.createAcceptor()
      return (path, content) => {
         const input = content.toString()

         const matching = this.entries.filter(it => it.matches(path) && input.includes(it.search))

         if (matching.length) {
            console.log(`Found ${matching.length} matches for ${chalk.underline(path)}`)

            const replaced = matching.reduce((current, entry) => {
               return current.replace(entry.search, entry.replacement)
            }, input)

            mergeAcceptor(path, replaced)
         }
      }
   }

   public async run(resolvers: { resolver: IResolver; name: string }[]) {
      const outDir = this.options.zipOutput ? resolve('tmp') : this.options.output
      emptyDirSync(outDir)

      const merger = createDefaultMerger({ ...this.options, includeAssets: true, includeData: true, title: 'Merged' })
      const acceptor = this.createAcceptor(merger)

      console.group('Replacing resources...')
      await Promise.all(
         resolvers.map(async ({ resolver, name }) => {
            console.log(name)
            await resolver.extract(acceptor)
         })
      )
      console.groupEnd()

      await merger.finalize()
   }
}
