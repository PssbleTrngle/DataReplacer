import type { Matcher, ReplaceEntryOptions } from './Options.js'

export interface ReplaceEntry {
   matches: Matcher
   search: string
   replacement: string
   options: ReplaceEntryOptions
}

export interface ModifyEntry {
   matches: Matcher
   mapper: (input: string | Buffer) => string | Buffer
}
