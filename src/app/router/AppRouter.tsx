import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { PlaceholderPage } from '../../pages/PlaceholderPage'
import { ArcadeShowPage } from '../../themes/arcade/ArcadeShowPage'

const HomePage = lazy(() => import('../../pages/HomePage').then((module) => ({ default: module.HomePage })))
const CreateShowPage = lazy(() => import('../../pages/CreateShowPage').then((module) => ({ default: module.CreateShowPage })))
const WheelShowPage = lazy(() => import('../../themes/wheel/WheelShowPage').then((module) => ({ default: module.WheelShowPage })))
const TeamDrawContentsPage = lazy(() => import('../../pages/TeamDrawContentsPage').then((module) => ({ default: module.TeamDrawContentsPage })))
const TeamDrawEditorPage = lazy(() => import('../../pages/TeamDrawEditorPage').then((module) => ({ default: module.TeamDrawEditorPage })))

const routes = [
  {
    path: '/show/casino',
    title: 'Casino Night',
    description: 'Theme preview coming in a future phase.',
  },
] as const

export function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="route-loading">Preparing the stage…</div>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="/create" element={<CreateShowPage />} />
            <Route path="/team-draw" element={<TeamDrawContentsPage />} />
            <Route path="/team-draw/new" element={<TeamDrawEditorPage />} />
            <Route path="/team-draw/:id/edit" element={<TeamDrawEditorPage />} />
            <Route path="/team-draw/:id/play" element={<ArcadeShowPage />} />
            <Route path="/team-draw/:id/result" element={<ArcadeShowPage />} />
            <Route path="/show/arcade" element={<ArcadeShowPage />} />
            <Route path="/show/wheel" element={<WheelShowPage />} />
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PlaceholderPage
                    title={route.title}
                    description={route.description}
                  />
                }
              />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
