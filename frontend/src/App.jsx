import React, { useEffect } from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import Login from './pages/user-login/Login'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"

import HomePage from './components/HomePage';
import { ProtectedRoute, PublicRoute } from './protected';

import Setting from './pages/settingSection/Setting';
import UserDetails from './components/UserDetails';
import Status from './pages/statusSection/Status';
import { useUserStore } from './store/useUserStore';
import { disconnectSocket, initializeSocket } from './services/chat.service';

const App = () => {

  const {user}=useUserStore()

  useEffect(()=>{
    if(user?._id){
      const socket=initializeSocket()
    }

    return ()=>{
      disconnectSocket()
    }
  },[user])
  return (
    <>
    <ToastContainer position='top-right' autoClose={3000}/>
    <Router>
      <Routes>
        <Route element={<PublicRoute/>}>
          <Route path='/user-login' element={<Login/>}></Route>

        </Route>

        <Route element={<ProtectedRoute/>}>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/user-profile' element={<UserDetails/>}/>
          <Route path='/status' element={<Status/>}/>
          <Route path='/setting' element={<Setting/>}/>

        </Route>
        
      </Routes>
    </Router>
    </>
  )
}

export default App
