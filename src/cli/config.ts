import { existsSync, readFileSync } from 'fs'
import { Options } from './options'

interface ConfiguredReplacements {
   loot?: Record<string, string>
   lang?: Record<string, string>
}

export default function getConfig(options: Options): ConfiguredReplacements {
   if (existsSync(options.config)) {
      const buffer = readFileSync(options.config)
      return JSON.parse(buffer.toString())
   }
   return {}
}
