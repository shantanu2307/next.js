import { runHiddenSetOfSets as runHiddenSetOfSetsExternal } from 'external-pkg/sourcemapped'
import { runHiddenSetOfSets as runHiddenSetOfSetsInternal } from 'internal-pkg/sourcemapped'

export default function Page() {
  runHiddenSetOfSetsExternal()
  runHiddenSetOfSetsInternal()

  return null
}
