import { extname } from 'path'
import { formatJson, replaceString, stringMatches } from '../textHelper.js'
import { createTypedHandler } from './Handler.js'

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
