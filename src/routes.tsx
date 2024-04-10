import { lazy, Suspense } from 'react'
import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'

import { RoutePaths } from '@/enums'

import { createDeepPath } from './helpers'
import PublicLayout from './layouts/PublicLayout'

export const AppRoutes = () => {
  const Votings = lazy(() => import('@/pages/Votings'))

  const router = createHashRouter([
    {
      path: RoutePaths.Root,
      element: (
        <PublicLayout>
          <Suspense fallback={<></>}>
            <Outlet />
          </Suspense>
        </PublicLayout>
      ),
      children: [
        {
          path: createDeepPath(RoutePaths.Votings),
          element: <Votings />,
        },
        {
          path: RoutePaths.Root,
          element: <Navigate replace to={RoutePaths.Votings} />,
        },
        {
          path: '*',
          element: <Navigate replace to={RoutePaths.Root} />,
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}
