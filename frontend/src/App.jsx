import React from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import Login from './pages/user-login/Login'
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/user-login' element={<Login/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
