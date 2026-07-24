import React, { useState } from 'react'
import { useLoginStore } from '../../store/useLoginStore'

const Login = () => {
  const {step,setStep,userPhoneData,setuserPhoneData}=useLoginStore()
  
  return (
    <div>
      Login page
    </div>
  )
}

export default Login
