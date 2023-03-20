import createJsonParser from '../parser/JsonParser.js'
import { replaceString, stringMatches } from '../textHelper.js'
import { createTypedHandler } from './Handler.js'

interface IntermediateType {
   values: Array<[string, string]>
   changed: string[]
}

const parser = createJsonParser<Record<string, string>>()

const rawHandler = createTypedHandler<IntermediateType, string[]>({
   parse: content => {
      const parsed = parser.parse(content)
      return { values: Object.entries(parsed), changed: [] }
   },
   encode: it => {
      const affectedContent = Object.fromEntries(it.values.filter(([key]) => it.changed.includes(key)))
      return parser.encode(affectedContent)
   },
   matches(entry, input) {
      const matches = input.values.filter(([, value]) => stringMatches(value, entry))
      if (matches.length) return matches.map(([key]) => key)
      return false
   },
   replace(entry, content, matches) {
      return {
         values: content.values.map(([key, value]) => {
            if (matches.includes(key)) return [key, replaceString(value, entry)]
            return [key, value]
         }),
         changed: [...content.changed, ...matches],
      }
   },
})

export default rawHandler
