import React, { useState } from 'react'
import { useLoginStore } from '../../store/useLoginStore'
import { countries } from '../../utils/countries'
import * as yup from "yup"
import {yupResolver} from "@hookform/resolvers/yup"
import  { useNavigate } from "react-router-dom"
import { useUserStore } from '../../store/useUserStore'
import { useThemeStore } from '../../store/useThemeStore'
import { motion } from "framer-motion"
import { useForm } from 'react-hook-form'
import { FaArrowLeft, FaChevronDown, FaUser, FaWhatsapp } from 'react-icons/fa';
import ReactCountryFlag from "react-country-flag";
import Spinner from '../../utils/Spinner'
import { sendOtp, updateUserProfile, verifyOtp } from '../../services/user.service'
import { toast } from 'react-toastify'



//validation schema 

const loginValidationSchema=yup
.object()
.shape({
  phoneNumber:yup.string().nullable().notRequired().matches(/^\d+$/,"Phone number must be digit").transform((value,originalValue)=>
    originalValue.trim()===""?null:value
  ),
  email:yup.string().nullable().notRequired().email("Please enter a valid email").transform((value,originalValue)=>
    originalValue.trim()===""?null:value
  )
})
.test(
    "at-least-one",
    "Either email or phone number is required",
    (value)=>{
      return !!(value.phoneNumber || value.email)
    }
)

const otpValidationSchema=yup
.object()
.shape({
  otp:yup.string().length("Otp must be exactly 6 digits").required("Otp is required")
})

const profileValidationSchema=yup
.object()
.shape({
  username:yup.string().required("username is required"),
  agreed:yup.bool().oneOf([true],'You must agree to the terms')
})

const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]


const Login = () => {
  const { step, setStep, userPhoneData, setUserPhoneData } = useLoginStore()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [otp, setOtp] = useState(["","","","","",""])
  const [email, setEmail] = useState("")
  const [profilePicture, setProfilePicture] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [error, setError] = useState("")
  const navigate= useNavigate()

  const {setUser}=useUserStore()

  const {theme,setTheme} = useThemeStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [loading, setLoading] = useState(false)

  const {
    register:loginRegister,
    handleSubmit:handleLoginSubmit,
    formState:{errors:loginErrors}
  } = useForm({
    resolver:yupResolver(loginValidationSchema)
  })

  const {
    handleSubmit:handleOtpSubmit,
    formState:{errors:otpErrors},
    setValue:setOtpValue
  } = useForm({
    resolver:yupResolver(otpValidationSchema)
  })

  const {
    register:profileRegister,
    handleSubmit:handleProfileSubmit,
    formState:{errors:profileErrors},
    watch
  } = useForm({
    resolver:yupResolver(profileValidationSchema)
  })

  const filterCountries=countries.filter(
    (country)=>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) || country.dialCode.includes(searchTerm)
    
  )

  const onLoginSubmit=async ()=>{
    try {
      setLoading(true)
      if(email){
        const response = await sendOtp(null,null,email)
        if(response.status === "success"){
          toast.info("OTP is sent to your email")
          setUserPhoneData({email})
          setStep(2)
        }
      }
      else{
        const response = await sendOtp(phoneNumber,selectedCountry.dialCode)
        if(response.status === "success"){
          toast.info("OTP is sent to your phone number")
          setUserPhoneData({phoneNumber,phoneSuffix:selectedCountry.dialCode})
          setStep(2)
        }
      }
    } catch (error) {
      console.log(error)
      setError(error.message || "Failed to send OTP")
    }
    finally{
      setLoading(false)
    }
  }

  const onOtpSubmit=async ()=>{
    try {
      setLoading(true)
      if(!userPhoneData){
        throw new Error("Phone or Email data is missing")
      }
      const otpString=otp.join("")
      let response
      if(userPhoneData?.email){
        response=await verifyOtp(null,null,otpString,userPhoneData.email)
      }
      else{
        response=await verifyOtp(userPhoneData.phoneNumber,userPhoneData.phoneSuffix,otpString)
      }

      if(response.status==="success"){
        toast.success("OTP is verified successfully")
        const user=response.data?.user
        if(user?.username && user?.profilePicture){
          setUser(user)
          toast.success("Welcome back to ChatApp")
          navigate("/")
          resetLoginState()

        }
      }
      else{
        setStep(3)
      }
    } catch (error) {
      console.log(error)
      setError(error.message || "Failed to verify OTP")
    }
    finally{
      setLoading(false)
    }
  }

  const handleChange=(e)=>{
    const file=e.target.file[0]
    if(file){
      setProfilePictureFile(file)
      setProfilePicture(URL.createObjectURL(file))
    }
  }

  const onProfileSubmit=async (data)=>{
    try {
      setLoading(true)
      const formData=new FormData()
      formData.append("username",data.username)
      formData.append("agreed",data.agreedToTerms)
      if(profilePictureFile){
        formData.append("media",profilePictureFile)
      }
      else{
        formData.append("profilePicture",selectedAvatar)
      }
      await updateUserProfile(formData)
      toast.success("Welcome back to ChatApp")
      navigate("/")
      resetLoginState()
    } catch (error) {
      console.log(error)
      setError(error.message || "Failed to update user profile")
    }
    finally{
      setLoading(false)
    }
  }

  const handleOtpChange =(index,value)=>{
    const newOtp=[...otp]
    newOtp[index]=value
    setOtp(newOtp)
    setOtpValue("otp",newOtp.join(""))
    if(value && index <5){
      document.getElementsById(`otp-${index+1}`).focus()
    }
  }


  const ProgressBar=()=>(
    <div className={`w-full ${theme==="dark" ? "bg-gray-700 " : "bg-gray-200"} rounded-full h-2.5 mb-6`}>
      <div className='bg-green-500 h-2.5 rounded-full translate-all duration-500 ease-in-out' style={{width:`${(step/3) * 100}%`}}>

      </div>

    </div>
  )

  const handleBack=()=>{
    setStep(1)
    setUserPhoneData(null)
    setOtp(["","","","","",""])
    setError("")
  }
  

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 "
          : "bg-linear-to-br from-green-400 to-blue-500"
      } flex items-center justify-center p-4 overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white "}  max-w-md p-6 md:p-8 rounded-lg shadow-2xl w-full relative z-10`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className={`w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center`}
        >
          <FaWhatsapp className="w-16 h-16 text-white" />
        </motion.div>

        <h1
          className={`text-3xl font-bold mb-6 text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          ChatApp Login
        </h1>

        <ProgressBar />

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {step === 1 && (
          <form
            className="space-y-4"
            onSubmit={handleLoginSubmit(onLoginSubmit)}
          >
            <p
              className={`text-center mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
            ></p>

            <div className="relative">
              <div className="flex">
                <div className="relative w-1/3">
                  <button
                    type="button"
                    className={`shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center ${theme === "dark" ? "text-white bg-gray-700 border-gray-600" : "text-gray-900 bg-gray-100 border-gray-300"} border rounded-s-lg hover:bg-gray-200 focus:right-4 focus:outline-none focus:ring-gray-100`}
                    onClick={() => setShowDropdown(true)}
                  >
                    <span>
                      <ReactCountryFlag
                        countryCode={selectedCountry.alpha2}
                        svg
                        style={{ width: "1.2em", height: "1.2em" }}
                      />{" "}
                      {selectedCountry.dialCode}
                    </span>

                    <FaChevronDown className="ml-2" />
                  </button>

                  {showDropdown && (
                    <div
                      className={`absolute z-10 w-full mt-1 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} border rounded-md shadow-lg max-h-60 overflow-auto`}
                    >
                      <div
                        className={`sticky top-0 ${theme === "dark" ? "bg-gray-700 " : "bg-white "} p-2 `}
                      >
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full px-2 py-1 border ${theme === "dark" ? "text-white bg-gray-600 border-gray-700" : "bg-white border-gray-300"} rounded-md text-sm focus:outline-none focus:right-2 focus:ring-green-500`}
                        />
                      </div>
                      {filterCountries.map((country) => (
                        <button
                          key={country.alpha2}
                          type="button"
                          className={`w-full text-left px-3 py-2 ${theme === "dark" ? "hover:bg-gray-600 " : "hover:bg-gray-100 "} focus:outline-none focus:bg-gray-100`}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowDropdown(false);
                          }}
                        >
                          <ReactCountryFlag
                            countryCode={country.alpha2}
                            svg
                            style={{ width: "1.2em", height: "1.2em" }}
                          />{" "}
                          ({country.dialCode}) {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  {...loginRegister("phoneNumber")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-2/3 px-4 py-2 border ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white " : "bg-white border-gray-300"} rounded-md  focus:outline-none focus:right-2 focus:ring-green-500 ${loginErrors.phoneNumber ? "border-red-500" : ""} `}
                  placeholder="Phone number"
                />
              </div>
              {loginErrors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {loginErrors.phoneNumber.message}
                </p>
              )}
            </div>

            {/*   Devider */}

            <div className="flex items-center my-4">
              <div className="grow h-px bg-gray-300"></div>
              <span className="mx-3 text-gray-500 text-sm font-medium">OR</span>
              <div className="grow h-px bg-gray-300"></div>
            </div>

            {/*   Email input */}

            <div
              className={`flex items-center border rounded-md px-3 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600  " : "bg-white border-gray-300"}`}
            >
              <FaUser
                className={`mr-2 text-gray-400 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              />

              <input
                type="email"
                {...loginRegister("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-transparent focus:outline-none ${theme === "dark" ? " text-white " : "bg-black"} ${loginErrors.email ? "border-red-500" : ""} `}
                placeholder="Email"
              />

              {loginErrors.email && (
                <p className="text-red-500 text-sm">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              {loading ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
            <p
              className={`text-center ${theme === "dark" ? " text-gray-300 " : "text-gray-600"}`}
            >
              Please enter the 6-digit OTP sent to your{" "}
              {userPhoneData ? userPhoneData.phoneSuffix : "Email"}{" "}
              {userPhoneData.phoneNumber && userPhoneData?.phoneNumber}
            </p>

            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className={`w-12 h-12 text-center border ${theme === "dark" ? " bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-600"} rounded-md focus:outline-none focus:ring-green-500 ${otpErrors.otp ? "border-red-500" : ""}`}
                />
              ))}
            </div>
            {loginErrors.otp && (
              <p className="text-red-500 text-sm">{loginErrors.otp.message}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              {loading ? <Spinner /> : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className={`w-full mt-2 ${theme === "dark" ? " bg-gray-700 text-gray-300" : " bg-gray-200 text-gray-700"}  py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center`}
            >
              <FaArrowLeft className="mr-2" />
              Wrong number? Go back
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
  
}

export default Login
