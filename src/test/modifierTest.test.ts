import { createResolver } from '@pssbletrngle/pack-resolver'
import { join } from 'path'
import Replacer from '../replacer/Replacer'
import createTestAcceptor from './TestAcceptor'

interface Content {
   array: Array<{
      name: string
      size: number
   }>
}

test('if can modify a json file', async () => {
   const resolver = createResolver({ from: 'example' })
   const acceptor = createTestAcceptor()

   const replacer = new Replacer()

   const filePath = join('assets', 'example', 'something', 'file.json')
   replacer.modifyJson<Content>(filePath, content => ({
      array: [
         ...content.array,
         {
            name: 'Deer',
            size: 5,
         },
      ],
   }))

   await replacer.run(resolver, acceptor)

   acceptor.expect(filePath, {
      array: [
         {
            name: 'Bear',
            size: 6,
         },
         {
            name: 'Cat',
            size: 2,
         },
         {
            name: 'Deer',
            size: 5,
         },
      ],
   })
})
