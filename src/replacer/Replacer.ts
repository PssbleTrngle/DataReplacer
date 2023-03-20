import { Acceptor, arrayOrSelf, createFilter, FilterOptions, IResolver } from '@pssbletrngle/pack-resolver'
import { createDefaultMergers, Options as MergeOptions } from '@pssbletrngle/resource-merger'
import match from 'minimatch'
import { Handler } from '../handler/Handler'
import langHandler from '../handler/LangHandler'
import rawHandler from '../handler/RawHandler'

export interface ReplaceEntryOptions {
   ignoreCase: boolean
}

type Matcher = (path: string) => boolean

export interface ReplaceEntry {
   matches: Matcher
   search: string
   replacement: string
   options: ReplaceEntryOptions
}

interface Filter extends ReplaceEntryOptions, FilterOptions {
   mod: string | string[]
   test: Matcher
}

type SpecificFilter = Omit<Filter, 'include'>

const defaultFilter: Filter = { mod: '*', ignoreCase: true, test: () => true }

function resolveFilter(partialFilter: Partial<Filter> = {}) {
   const filter = { ...defaultFilter, ...partialFilter }
   const patternFilters = arrayOrSelf(filter.mod).map<Matcher>(mod => {
      const [include, exclude] = [filter.include, filter.exclude]
         .map(arrayOrSelf)
         .map(it => it.map(pattern => pattern.replace(/\$mod/, mod)))
      return createFilter({ include, exclude })
   })

   const matches: Matcher = it => filter.test(it) && patternFilters.some(test => test(it))
   return { matches, options: filter }
}

export default class Replacer {
   private entries: ReplaceEntry[] = []
   private handlers: { pattern: string; handler: Handler }[] = []

   constructor() {
      this.addHandler('assets/*/lang/*.json', langHandler)
   }

   public addHandler(pattern: string, handler: Handler) {
      this.handlers.push({ pattern, handler })
   }

   public replace(search: string, replacement: string, filter?: Partial<Filter>) {
      const { matches, options } = resolveFilter(filter)
      this.entries.push({ matches, search, replacement, options })
   }

   public replaceLootItem(search: string, replacement: string, filter?: Partial<SpecificFilter>) {
      const wrap = (s: string) => `"name": "${s}"`
      this.replace(wrap(search), wrap(replacement), {
         ...filter,
         include: [
            'data/$mod/loot_tables/**/*.json',
            'data/$mod/loot_modifiers/**/*.json',
            'data/$mod/modifiers/loot_tables/**/*.json',
         ],
      })
   }

   public replaceLang(search: string, replacement: string, filter?: Partial<SpecificFilter & { lang: string }>) {
      this.replace(search, replacement, {
         ignoreCase: false,
         ...filter,
         include: `assets/$mod/lang/${filter?.lang ?? '*'}.json`,
      })
   }

   public getHandler(path: string) {
      return this.handlers.find(it => match(path, it.pattern))?.handler
   }

   public createAcceptor(output: Acceptor): Acceptor {
      return (path, content) => {
         const matching = this.entries.filter(it => it.matches(path))
         if (matching.length === 0) return false

         const handler = this.getHandler(path) ?? rawHandler
         const replaced = handler.replace(matching, content, path)

         if (replaced) {
            return output(path, replaced)
         } else {
            return false
         }
      }
   }

   public async run(resolver: IResolver, output: Acceptor) {
      console.group('Replacing resources...')
      const acceptor = this.createAcceptor(output)
      await resolver.extract(acceptor)
      console.groupEnd()
   }

   public async runAndMerge(resolver: IResolver, mergeOptions: MergeOptions) {
      const merger = createDefaultMergers(mergeOptions)
      const mergeAcceptor = merger.createAcceptor()
      await this.run(resolver, mergeAcceptor)
      await merger.finalize()
   }
}
