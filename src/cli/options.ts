import { Options as ResolverOptions } from '@pssbletrngle/pack-resolver'
import { getMergeOptions, Options as MergeOptions } from '@pssbletrngle/resource-merger'
import arg from 'arg'
import commandLineUsage, { Section } from 'command-line-usage'

const sections: Section[] = [
   {
      header: 'Data Replacer',
      content: 'Programmatically replace text in data/resource packs',
   },
   {
      header: 'Options',
      optionList: [
         {
            name: 'merge-config',
            defaultValue: '.mergerrc',
            typeLabel: '{underline string}',
            description: 'The to read additional options for the resource-merger from',
         },
         {
            name: 'help',
            alias: 'h',
            description: 'Print this usage guide.',
         },
      ],
   },
]

export interface Options extends MergeOptions, ResolverOptions {
   config: string
}

export default function getOptions(): Options {
   const args = arg({
      '--merge-config': String,
      '--config': String,
      '-c': '--config',
      '--help': Boolean,
      '-h': '--help',
   })

   if (args['--help']) {
      const usage = commandLineUsage(sections)
      console.log(usage)
      process.exit(0)
   }

   const mergeOptions = getMergeOptions(args['--merge-config'])
   return {
      from: 'resources',
      ...mergeOptions,
      config: args['--config'] ?? 'replacements.json',
   }
}
