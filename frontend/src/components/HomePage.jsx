import React, { useEffect, useState } from 'react'
import {motion} from "framer-motion"
import Layout from './Layout'
import ChatList from '../pages/chatSection/ChatList'
import { getAllUsers } from '../services/user.service'


const HomePage = () => {

  

  const [allUsers, setAllUsers] = useState([])
  const loadAllUsers=async ()=>{
    try {
      const result=await getAllUsers()
      if(result.status==="success"){
        setAllUsers(result.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{
    loadAllUsers()
  },[])
  return (
    <Layout>
      <motion.div
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{duration:0.5}}
      className='h-full'>
        <ChatList contacts={allUsers} />
      </motion.div>
    </Layout>
  )
}

export default HomePage
