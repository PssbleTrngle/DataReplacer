import { format } from 'prettier'
import type { ReplaceEntry } from './replacer/Entries.js'

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
