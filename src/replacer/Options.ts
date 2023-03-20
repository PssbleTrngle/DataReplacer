import { arrayOrSelf, createFilter, FilterOptions } from '@pssbletrngle/pack-resolver'

export type Matcher = (path: string) => boolean

export interface ReplaceEntryOptions {
   ignoreCase: boolean
}

export interface Filter extends ReplaceEntryOptions, FilterOptions {
   mod: string | string[]
   test: Matcher
}

export type SpecificFilter = Omit<Filter, 'include'>

const defaultFilter: Filter = { mod: '*', ignoreCase: true, test: () => true }

export type FilterInput = Partial<Filter> | string

export function resolveFilter(filterInput: FilterInput = {}) {
   const partialFilter = typeof filterInput === 'string' ? { include: filterInput } : filterInput
   const filter = { ...defaultFilter, ...partialFilter }
   const patternFilters = arrayOrSelf(filter.mod).map<Matcher>(mod => {
      const [include, exclude] = [filter.include, filter.exclude]
         .map(arrayOrSelf)
         .map(it => it.map(pattern => pattern.replace(/\$mod/, mod)))
      return createFilter({ include, exclude })
   })

   const matches: Matcher = it => filter.test(it) && patternFilters.some(test => test(it))
   return { matches, options: filter }
}
