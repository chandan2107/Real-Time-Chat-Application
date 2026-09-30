import React, { useEffect, useState } from 'react'
import {useLocation} from "react-router-dom"
import { useLayoutStore } from '../store/layoutStore'
import { useThemeStore } from '../store/useThemeStore'
import SideBar from './SideBar'
import {motion,AnimatePresence} from "framer-motion"
import ChatWindow from '../pages/chatSection/ChatWindow'



const Layout = ({children,isThemeDialogOpen,toggleThemeDialog,isStatusPreviewOpen,statusPreviewContent}) => {

  const {theme,setTheme} = useThemeStore()
  const selectedContact=useLayoutStore(state=>state.selectedContact)
  const setSelectedContact=useLayoutStore(state=>state.setSelectedContact)
  const location= useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth<768)

  useEffect(()=>{
    const handleResize=()=>{
      setIsMobile(window.innerWidth<768)
    }
    window.addEventListener("resize",handleResize)
    return ()=>window.removeEventListener("resize",handleResize)
  },[])
  return (
    <div className={`h-screen w-screen overflow-hidden ${theme === "dark" ? "bg-[#111b21] text-white" : "bg-white text-black"} flex relative`}>
      {!isMobile && <SideBar/>}
      <div className={`flex-1 flex overflow-hidden ${isMobile ? "flex-col":""}`}>
        <AnimatePresence initial={false}>
          {
            (!selectedContact || !isMobile) && (
              <motion.div 
              key="chatlist"
              initial={{x:isMobile ? "-100%":0}}
              animate={{x:0}}
              transition={{type:"tween"}}
              className={`w-full md:w-[380px] lg:w-[420px] shrink-0 h-full ${isMobile ? "pb-14" : ""}`}>
                {children}

              </motion.div>
            )
          }

          {
            (selectedContact || !isMobile) && (
              <motion.div 
              key="chatWindow"
              initial={{x:isMobile ? "-100%":0}}
              animate={{x:0}}
              transition={{type:"tween"}}
              className="flex-1 h-full min-w-0">
                {<ChatWindow 
                selectedContact={selectedContact}
                setSelectedContact={setSelectedContact}
                isMobile={isMobile}
                />}

              </motion.div>
            )
          }


        </AnimatePresence>

      </div>

      {isMobile && <SideBar/>}

      {
        isThemeDialogOpen && (
          <div className='fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4'>
            <div className={`${theme ==="dark" ? "bg-[#202c33] text-white border border-[#222e35]" : "bg-white text-gray-900 border border-gray-100"} p-6 rounded-2xl max-w-sm w-full shadow-2xl`}>
              <h2 className='text-xl font-semibold mb-4'>
                Choose a theme
              </h2>
              <div className='space-y-3.5'>
                <label className='flex items-center space-x-3 cursor-pointer select-none'>
                  <input 
                  type='radio'
                  value="light"
                  checked={theme==="light"}
                  onChange={()=>setTheme("light")}
                  className='accent-[#00a884] h-4 w-4'
                  />
                  <span className="text-sm font-medium">Light</span>
                </label>

                <label className='flex items-center space-x-3 cursor-pointer select-none'>
                  <input 
                  type='radio'
                  value="dark"
                  checked={theme==="dark"}
                  onChange={()=>setTheme("dark")}
                  className='accent-[#00a884] h-4 w-4'
                  />
                  <span className="text-sm font-medium">Dark</span>
                </label>
              </div>
              <button onClick={toggleThemeDialog}
              className='mt-6 w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-2.5 rounded-xl font-medium transition cursor-pointer text-sm'>
                Close
              </button>

            </div>
          </div>        
          )
      }

      {/*status preview*/}

      {isStatusPreviewOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          {statusPreviewContent}
        </div>
      )}
    </div>
  )
}

export default Layout
