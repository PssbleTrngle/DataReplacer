import { createTypedHandler } from './Handler'
import { formatJson, replaceString, stringMatches } from './RawHandler'

interface IntermediateType {
   values: Array<[string, string]>
   changed: string[]
}

const rawHandler = createTypedHandler<IntermediateType, string[]>({
   parse: content => {
      const parsed: Record<string, string> = JSON.parse(content.toString())
      return { values: Object.entries(parsed), changed: [] }
   },
   encode: it => {
      const affectedContent = Object.fromEntries(it.values.filter(([key]) => it.changed.includes(key)))
      return formatJson(JSON.stringify(affectedContent))
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
