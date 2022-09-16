import { getMergeOptions, MergeOptions } from '@pssbletrngle/resource-merger'
import arg from 'arg'

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
}

export default function getOptions(): Options {
   const mergeOptions = getMergeOptions(args['--merge-config'])
   return {
      ...mergeOptions,
      config: args['--config'] ?? 'replacements.json',
   }
}
