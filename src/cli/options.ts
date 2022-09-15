import arg from 'arg'
import { existsSync, readFileSync, statSync } from 'fs'
import { extname } from 'path'
import { MergeOptions } from '../replacer/options.js'

const args = arg({
   '--merge-config': String,
   '--config': String,
   '--include-assets': Boolean,
   '--include-data': Boolean,
   '--from': String,
   '--output': String,
   '-c': '--config',
})

export interface Options extends MergeOptions {
   config: string
   from: string
}

// use from library
function readConfig(optionsFile?: string) {
   const file = optionsFile ?? args['--merge-config'] ?? '.mergerrc'
   if (existsSync(file)) {
      const buffer = readFileSync(file)
      return JSON.parse(buffer.toString()) as Partial<Options>
   }
   return null
}

// call to getMergeOptions & getResolverOptions
export default function getOptions(optionsFile?: string): Options {
   const config = readConfig(optionsFile)
   const output = args['--output'] ?? config?.output ?? 'merged.zip'
   const existingOutputDir = existsSync(output) && statSync(output).isDirectory()

   return {
      from: args['--from'] ?? config?.from ?? 'resources',
      output,
      zipOutput: !existingOutputDir && ['.zip', '.jar'].includes(extname(output)),
      config: args['--config'] ?? 'replacements.json',
   }
}
