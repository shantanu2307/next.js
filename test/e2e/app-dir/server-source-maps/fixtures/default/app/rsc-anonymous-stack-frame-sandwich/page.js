import { runHiddenSetOfSets as runHiddenSetOfSetsExternal } from 'external-pkg/sourcemapped'
import { runHiddenSetOfSets as runHiddenSetOfSetsInternal } from 'internal-pkg/ignored'

export default function Page() {
  runHiddenSetOfSetsExternal()
  runHiddenSetOfSetsInternal()

  return null
}
