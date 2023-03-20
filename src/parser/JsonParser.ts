import { formatJson } from '../textHelper.js'
import Parser from './Parser.js'

export default function createJsonParser<T>(): Parser<T> {
   return {
      encode: value => formatJson(JSON.stringify(value)),
      parse: raw => JSON.parse(raw.toString()) as T,
   }
}
