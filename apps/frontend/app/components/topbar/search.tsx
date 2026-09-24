import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useLocation } from 'react-router'

export const SearchBar = () => {
  const location = useLocation()
  const isPlayerRoute = location.pathname === '/'

  return <div className="flex justify-center w-full">
    <AnimatePresence>
      {isPlayerRoute && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card backdrop-blur-xs border-solid border-1"
          >
            <Search size={15} className="text-muted-foreground" />
            <input
              placeholder="Search artists, albums, tracks…"
              className="bg-transparent outline-none text-sm w-full text-foreground"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
}

export default SearchBar
