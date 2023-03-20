import { createResolver } from '@pssbletrngle/pack-resolver'
import { join } from 'path'
import Replacer from '../replacer/Replacer'
import createTestAcceptor from './TestAcceptor'

test('if raw content gets correctly replaced', async () => {
   const resolver = createResolver({ from: 'example' })
   const acceptor = createTestAcceptor()

   const replacer = new Replacer()

   replacer.replace('Bear', 'Mule')

   await replacer.run(resolver, acceptor)

   acceptor.expect(join('assets', 'example', 'something', 'file.json'), {
      array: [
         {
            name: 'Mule',
            size: 6,
         },
         {
            name: 'Cat',
            size: 2,
         },
      ],
   })
})

test('if only affected lang lines are emitted', async () => {
   const resolver = createResolver({ from: 'example' })
   const acceptor = createTestAcceptor()

   const replacer = new Replacer()

   replacer.replaceLang('Horse', 'Mule')
   replacer.replaceLang('Dog', 'Dough')

   await replacer.run(resolver, acceptor)

   acceptor.expect(join('assets', 'example', 'lang', 'en_us.json'), {
      'animal.horse.name': 'Mule',
      'animal.dog.name': 'Dough',
   })
})
