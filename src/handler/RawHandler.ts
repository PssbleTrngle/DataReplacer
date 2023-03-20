import { extname } from 'path'
import { format } from 'prettier'
import { ReplaceEntry } from '../replacer/Replacer.js'
import { createTypedHandler } from './Handler.js'

export function stringMatches(input: string, { options, search }: ReplaceEntry) {
   if (options.ignoreCase) return input.toLowerCase().includes(search.toLowerCase())
   return input.includes(search)
}

export function formatJson(input: string) {
   return format(input, { parser: 'json' })
}

export function replaceString(input: string, { replacement, search }: ReplaceEntry) {
   return input.replace(new RegExp(search, 'g'), replacement)
}

const rawHandler = createTypedHandler({
   parse: (content, path) => {
      const input = content.toString()
      switch (extname(path)) {
         case '.json':
         case '.mcmeta':
            formatJson(input)
         default:
            return input
      }
   },
   encode: it => it,
   matches: (entry, input: string) => stringMatches(input, entry),
   replace: (entry, content) => replaceString(content, entry),
})

export default rawHandler
