import { Outlet } from 'react-router'

import Player from '@/components/player/player'
import PlayerTopBar from '@/components/topbar/topbar'

export const LoggedInLayout = () => {
  return <div className="relative w-full h-screen overflow-hidden bg-background text-text">
    <PlayerTopBar />
    <div className="absolute top-0 left-60 right-0 bottom-0 overflow-y-auto pt-20 px-8 pb-32 flex justify-center">
      <Outlet />
    </div>
    <Player />
  </div>
}

export default LoggedInLayout
