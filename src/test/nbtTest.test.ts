import { createResolver } from '@pssbletrngle/pack-resolver'
import Replacer from '../replacer/Replacer'
import createTestAcceptor from './TestAcceptor'

test('if nbt content gets correctly replaced', async () => {
   const resolver = createResolver({ from: 'example' })
   const acceptor = createTestAcceptor()

   const replacer = new Replacer()

   replacer.replace('minecraft:oak_planks', 'minecraft:diamond_block', { include: 'data/*/structures/**/*.nbt' })

   await replacer.run(resolver, acceptor)
})
