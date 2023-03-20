import chalk from 'chalk'
import type { ReplaceEntry } from '../replacer/Replacer'

export interface Handler {
   replace(entries: ReplaceEntry[], content: string | Buffer, path: string): string | Buffer | null
}

export function createTypedHandler<T, I = boolean>(handler: {
   parse(content: string | Buffer, path: string): T
   encode(value: T): string | Buffer
   matches(entry: ReplaceEntry, content: T): I | false
   replace(entries: ReplaceEntry, content: T, intermediate: Exclude<I, false>): T
}): Handler {
   return {
      replace: (entries, content, path) => {
         let parsed: T

         try {
            parsed = handler.parse(content, path)
         } catch (error) {
            console.warn(chalk.yellow(`Could not parse ${chalk.underline(path)}`))
            return null
         }

         const matching = entries
            .map(entry => ({ entry, intermediate: handler.matches(entry, parsed) }))
            .filter(it => it.intermediate !== false)

         if (matching.length) {
            console.log(`Found ${matching.length} matches for ${chalk.underline(path)}`)
            const replaced = matching.reduce(
               (from, { entry, intermediate }) => handler.replace(entry, from, intermediate as Exclude<I, false>),
               parsed
            )
            return handler.encode(replaced)
         }

         return content
      },
   }
}
