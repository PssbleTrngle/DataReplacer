import { createResolver } from '@pssbletrngle/pack-resolver'
import chalk from 'chalk'
import Replacer from '../replacer/Replacer.js'
import getConfig from './config.js'
import getOptions from './options.js'

async function run() {
   const options = getOptions()
   const replacer = new Replacer(options)

   const config = getConfig(options)

   Object.entries(config.loot ?? {}).forEach(([search, replacement]) => {
      replacer.replaceLootItem(search, replacement)
   })

   Object.entries(config.lang ?? {}).forEach(([search, replacement]) => {
      replacer.replaceLang(search, replacement)
   })

   const resolvers = createResolver(options)
   await replacer.run(resolvers)
}

run().catch(async e => {
   console.error(chalk.red(e.message))
})
