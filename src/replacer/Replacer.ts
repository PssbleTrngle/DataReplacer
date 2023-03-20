import { Acceptor, IResolver } from '@pssbletrngle/pack-resolver'
import { createDefaultMergers, Options as MergeOptions } from '@pssbletrngle/resource-merger'
import match from 'minimatch'
import { Handler } from '../handler/Handler.js'
import langHandler from '../handler/LangHandler.js'
import rawHandler from '../handler/RawHandler.js'
import createJsonParser from '../parser/JsonParser.js'
import Parser from '../parser/Parser.js'
import { ModifyEntry, ReplaceEntry } from './Entries.js'
import { FilterInput, resolveFilter, SpecificFilter } from './Options.js'

export default class Replacer {
   private modifiers: ModifyEntry[] = []
   private replacements: ReplaceEntry[] = []
   private handlers: { pattern: string; handler: Handler }[] = []

   constructor() {
      this.addHandler('assets/*/lang/*.json', langHandler)
   }

   public addHandler(pattern: string, handler: Handler) {
      this.handlers.push({ pattern, handler })
   }

   public replace(search: string, replacement: string, filter?: FilterInput) {
      const { matches, options } = resolveFilter(filter)
      this.replacements.push({ matches, search, replacement, options })
   }

   public modify(filter: FilterInput, mapper: (input: string | Buffer) => string | Buffer) {
      const { matches } = resolveFilter(filter)
      this.modifiers.push({ mapper, matches })
   }

   private modifyWith<T>(parser: Parser<T>, filter: FilterInput, mapper: (input: T) => T) {
      this.modify(filter, input => {
         const parsed = parser.parse(input)
         const modified = mapper(parsed)
         return parser.encode(modified)
      })
   }

   public modifyJson<T>(filter: FilterInput, mapper: (input: T) => T) {
      const parser = createJsonParser<T>()
      this.modifyWith(parser, filter, mapper)
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
         const replacements = this.replacements.filter(it => it.matches(path))
         const modifications = this.modifiers.filter(it => it.matches(path))

         if (replacements.length === 0 && modifications.length === 0) return false

         const modified = modifications.reduce((it, { mapper }) => mapper(it), content)

         const handler = this.getHandler(path) ?? rawHandler
         const replaced = handler.replace(replacements, modified, path)

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
