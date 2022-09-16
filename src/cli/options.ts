import { Options as ResolverOptions } from '@pssbletrngle/pack-resolver'
import { getMergeOptions, Options as MergeOptions } from '@pssbletrngle/resource-merger'
import arg from 'arg'

const args = arg({
   '--merge-config': String,
   '--config': String,
   '-c': '--config',
})

export interface Options extends MergeOptions, ResolverOptions {
   config: string
}

export default function getOptions(): Options {
   const mergeOptions = getMergeOptions(args['--merge-config'])
   return {
      ...mergeOptions,
      config: args['--config'] ?? 'replacements.json',
   }
}
