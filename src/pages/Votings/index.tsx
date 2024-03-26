import { Navigate } from 'react-router-dom'

import { RoutePaths } from '@/enums'
import { useNestedRoutes } from '@/hooks'
import { VotingsContextProvider } from '@/pages/Votings/contexts'
import { VotingsId, VotingsList } from '@/pages/Votings/pages'

export default function Votings() {
  return (
    <VotingsContextProvider>
      {useNestedRoutes(RoutePaths.Votings, [
        {
          index: true,
          element: <Navigate replace to={RoutePaths.VotingsList} />,
        },
        {
          path: RoutePaths.VotingsList,
          element: <VotingsList />,
        },
        {
          path: RoutePaths.VotingsId,
          element: <VotingsId />,
        },
      ])}
    </VotingsContextProvider>
  )
}
