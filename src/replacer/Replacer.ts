import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver'
import { createDefaultMergers, Mergers, Options as MergeOptions } from '@pssbletrngle/resource-merger'
import chalk from 'chalk'
import minimatch from 'minimatch'
import { extname } from 'path'
import { format } from 'prettier'

interface ReplaceEntryOptions {
   ignoreCase: boolean
}

interface ReplaceEntry {
   matches(path: string): boolean
   search: string
   replacement: string
   options: ReplaceEntryOptions
}

function arrayOrSelf<T>(value: T | T[]) {
   return Array.isArray(value) ? value : [value]
}

interface Filter extends ReplaceEntryOptions {
   mod: string | string[]
   test(path: string): boolean
}

const defaultFilter: Filter = { mod: '*', test: () => true, ignoreCase: true }

function resolveFilter(partialFilter: Partial<Filter> = {}) {
   const filter = { ...defaultFilter, ...partialFilter }
   return arrayOrSelf(filter.mod).map(mod => ({ ...filter, mod }))
}

export default class Replacer {
   private entries: ReplaceEntry[] = []

   constructor(private readonly mergeOptions: MergeOptions) {}

   public replace(pattern: string, search: string, replacement: string, filter?: Partial<Filter>) {
      resolveFilter(filter).forEach(({ mod, test, ...options }) => {
         const resolvedPattern = pattern.replace(/\$mod/, mod)
         const matches: ReplaceEntry['matches'] = it => minimatch(it, resolvedPattern) && test(it)
         this.entries.push({ matches, search, replacement, options })
      })
   }

   public replaceLootItem(search: string, replacement: string, filter?: Partial<Filter>) {
      const wrap = (s: string) => `"name": "${s}"`
      this.replace('data/$mod/loot_tables/**/*.json', wrap(search), wrap(replacement), filter)
   }

   public replaceLang(search: string, replacement: string, filter?: Partial<Filter & { lang: string }>) {
      this.replace(`assets/$mod/lang/${filter?.lang ?? '*'}.json`, search, replacement, {
         ignoreCase: false,
         ...filter,
      })
   }

   private format(content: string, path: string) {
      try {
         switch (extname(path)) {
            case '.json':
            case '.mcmeta':
               return format(content, { parser: 'json' })
            default:
               return content
         }
      } catch {
         console.warn(chalk.yellow(`Could not parse ${chalk.underline(path)}`))
         return null
      }
   }

   public createAcceptor(merger: Mergers): Acceptor {
      const mergeAcceptor = merger.createAcceptor()
      return (path, content) => {
         const input = this.format(content.toString(), path)
         if (!input) return false

         const matching = this.entries.filter(it => {
            if (!it.matches(path)) return false
            if (it.options.ignoreCase) return input.toLowerCase().includes(it.search.toLowerCase())
            return input.includes(it.search)
         })

         if (matching.length) {
            console.log(`Found ${matching.length} matches for ${chalk.underline(path)}`)

            const replaced = matching.reduce((current, entry) => {
               return current.replace(new RegExp(entry.search, 'g'), entry.replacement)
            }, input)

            return mergeAcceptor(path, replaced)
         } else {
            return false
         }
      }
   }

   public async run(resolver: IResolver) {
      const merger = createDefaultMergers(this.mergeOptions)
      const acceptor = this.createAcceptor(merger)

      console.group('Replacing resources...')
      await resolver.extract(acceptor)
      console.groupEnd()

      await merger.finalize()
   }
}
