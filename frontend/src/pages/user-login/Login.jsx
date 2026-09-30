import React, { useRef, useState } from 'react'
import { useLoginStore } from '../../store/useLoginStore'
import { countries } from '../../utils/countries'
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate } from "react-router-dom"
import { useUserStore } from '../../store/useUserStore'
import { useThemeStore } from '../../store/useThemeStore'
import { motion } from "framer-motion"
import { useForm } from 'react-hook-form'
import { FaArrowLeft, FaChevronDown, FaPlus, FaUser } from 'react-icons/fa';
import { RiChatSmile2Line } from "react-icons/ri";
import ReactCountryFlag from "react-country-flag";
import Spinner from '../../utils/Spinner'
import { sendOtp, updateUserProfile, verifyOtp } from '../../services/user.service'
import { toast } from 'react-toastify'
import useOutsideClick from '../../hooks/useOutsideClick'

// validation schema 
const loginValidationSchema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d+$/, "Phone number must be digits")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
      ),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email("Please enter a valid email")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
      )
  })
  .test(
    "at-least-one",
    "Either email or phone number is required",
    (value) => {
      return !!(value.phoneNumber || value.email)
    }
  )

const otpValidationSchema = yup
  .object()
  .shape({
    otp: yup.string().length(6, "OTP must be exactly 6 digits").required("OTP is required")
  })

const profileValidationSchema = yup
  .object()
  .shape({
    username: yup.string().required("Username is required"),
    agreedToTerms: yup.bool().oneOf([true], 'You must agree to the terms')
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
  const { step, setStep, userPhoneData, setUserPhoneData, resetLoginStore } = useLoginStore()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [profilePicture, setProfilePicture] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const { setUser } = useUserStore()
  const { theme } = useThemeStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)

  const [loading, setLoading] = useState(false)

  const resetLoginState = () => {
    if (typeof resetLoginStore === 'function') resetLoginStore()
  }

  useOutsideClick(dropdownRef, () => {
    if (showDropdown) setShowDropdown(false)
  })

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: yupResolver(loginValidationSchema)
  })

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue
  } = useForm({
    resolver: yupResolver(otpValidationSchema)
  })

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch
  } = useForm({
    resolver: yupResolver(profileValidationSchema)
  })

  const filterCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) || country.dialCode.includes(searchTerm)
  )

  const onLoginSubmit = async () => {
    try {
      setLoading(true)
      if (email) {
        const response = await sendOtp(null, null, email)
        if (response.status === "success") {
          toast.info("OTP is sent to your email")
          setUserPhoneData({ email })
          setStep(2)
        }
      } else {
        const response = await sendOtp(phoneNumber, selectedCountry.dialCode)
        if (response.status === "success") {
          toast.info("OTP is sent to your phone number")
          setUserPhoneData({ phoneNumber, phoneSuffix: selectedCountry.dialCode })
          setStep(2)
        }
      }
    } catch (error) {
      console.log(error)
      setError(error.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const onOtpSubmit = async () => {
    try {
      setLoading(true)
      if (!userPhoneData) {
        throw new Error("Phone or Email data is missing")
      }
      const otpString = otp.join("")
      let response
      if (userPhoneData?.email) {
        response = await verifyOtp(null, null, userPhoneData.email, otpString)
      } else {
        response = await verifyOtp(userPhoneData.phoneNumber, userPhoneData.phoneSuffix, null, otpString)
      }

      if (response.status === "success") {
        const token = response.data?.token
        localStorage.setItem("auth_token", token)
        toast.success("OTP is verified successfully")
        const user = response.data?.user
        if (user?.username && user?.profilePicture) {
          setUser(user)
          toast.success("Welcome back to ChatApp")
          navigate("/")
          resetLoginState()
        } else {
          setStep(3)
        }
      }
    } catch (error) {
      console.log(error)
      setError(error.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePictureFile(file)
      setProfilePicture(URL.createObjectURL(file))
    }
  }

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("username", data.username)
      formData.append("agreedToTerms", data.agreedToTerms)
      if (profilePictureFile) {
        formData.append("media", profilePictureFile)
      } else {
        formData.append("profilePicture", selectedAvatar)
      }
      const response = await updateUserProfile(formData)
      if (response?.data) {
        setUser(response.data)
      }
      toast.success("Welcome back to ChatApp")
      navigate("/")
      resetLoginState()
    } catch (error) {
      console.log(error)
      setError(error.message || "Failed to update user profile")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpValue("otp", newOtp.join(""))
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const ProgressBar = () => (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step
              ? "bg-[#00a884]"
              : theme === "dark"
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
        />
      ))}
    </div>
  )

  const handleBack = () => {
    setStep(1)
    setUserPhoneData(null)
    setOtp(["", "", "", "", "", ""])
    setError("")
  }

  return (
    <div
      className={`min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden ${theme === "dark" ? "bg-[#0c1317]" : "bg-[#f0f2f5]"
        }`}
    >



      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-[420px] p-6 sm:p-8 rounded-2xl ${theme === "dark"
            ? "bg-[#111b21] text-white border border-[#222e35] shadow-[0_8px_32px_rgba(0,0,0,0.36)]"
            : "bg-white text-gray-900 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]"
          }`}
      >

        <div className="w-14 h-14 bg-[#00a884] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xs">
          <RiChatSmile2Line className="w-8 h-8 text-white" />
        </div>

        <h1
          className={`text-2xl font-bold tracking-tight mb-5 text-center ${theme === "dark" ? "text-white" : "text-gray-900"
            }`}
        >
          Welcome to ChatApp
        </h1>

        <ProgressBar />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}


        {step === 1 && (
          <form
            className="space-y-4"
            onSubmit={handleLoginSubmit(onLoginSubmit)}
          >
            <div className="relative">
              <div
                ref={dropdownRef}
                className={`relative flex items-center rounded-xl border transition-all ${loginErrors.phoneNumber
                    ? "border-red-500 ring-1 ring-red-500/20"
                    : theme === "dark"
                      ? "border-gray-700 bg-gray-800/60 focus-within:border-[#00a884] focus-within:ring-2 focus-within:ring-[#00a884]/20"
                      : "border-gray-200 bg-gray-50/60 focus-within:border-[#00a884] focus-within:ring-2 focus-within:ring-[#00a884]/20 focus-within:bg-white"
                  }`}
              >
                <button
                  type="button"
                  className={`shrink-0 flex items-center gap-1.5 py-3 px-3.5 text-sm font-medium border-r transition ${theme === "dark"
                      ? "text-gray-200 border-gray-700 hover:bg-gray-700/50"
                      : "text-gray-700 border-gray-200 hover:bg-gray-100"
                    } rounded-l-xl focus:outline-none cursor-pointer`}
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  <ReactCountryFlag
                    countryCode={selectedCountry.alpha2}
                    svg
                    style={{ width: "1.25em", height: "1.25em" }}
                  />
                  <span>{selectedCountry.dialCode}</span>
                  <FaChevronDown className="text-xs text-gray-400 ml-0.5" />
                </button>

                {showDropdown && (
                  <div
                    className={`absolute left-0 top-full mt-2 w-72 z-50 rounded-xl shadow-xl border overflow-hidden ${theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-200 text-gray-900"
                      }`}
                  >
                    <div
                      className={`p-2.5 border-b ${theme === "dark"
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-100 bg-gray-50"
                        }`}
                    >
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none ${theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00a884]"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#00a884]"
                          }`}
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                      {filterCountries.map((country) => (
                        <button
                          key={country.alpha2}
                          type="button"
                          className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-sm transition ${theme === "dark"
                              ? "hover:bg-gray-700/70 text-gray-200"
                              : "hover:bg-gray-50 text-gray-800"
                            } focus:outline-none cursor-pointer`}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowDropdown(false);
                          }}
                        >
                          <ReactCountryFlag
                            countryCode={country.alpha2}
                            svg
                            style={{ width: "1.2em", height: "1.2em" }}
                          />
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            {country.dialCode}
                          </span>
                          <span className="truncate">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  {...loginRegister("phoneNumber")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full bg-transparent px-3.5 py-3 text-sm font-medium focus:outline-none ${theme === "dark"
                      ? "text-white placeholder-gray-500"
                      : "text-gray-900 placeholder-gray-400"
                    }`}
                  placeholder="Phone number"
                />
              </div>
              {loginErrors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {loginErrors.phoneNumber.message}
                </p>
              )}
            </div>


            <div className="flex items-center my-4">
              <div
                className={`grow h-px ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
              />
              <span
                className={`mx-3 text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-400"
                  }`}
              >
                OR
              </span>
              <div
                className={`grow h-px ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
              />
            </div>


            <div>
              <div
                className={`flex items-center rounded-xl border transition-all px-3.5 py-3 ${loginErrors.email
                    ? "border-red-500 ring-1 ring-red-500/20"
                    : theme === "dark"
                      ? "border-gray-700 bg-gray-800/60 focus-within:border-[#00a884] focus-within:ring-2 focus-within:ring-[#00a884]/20"
                      : "border-gray-200 bg-gray-50/60 focus-within:border-[#00a884] focus-within:ring-2 focus-within:ring-[#00a884]/20 focus-within:bg-white"
                  }`}
              >
                <FaUser
                  className={`mr-2.5 text-sm shrink-0 ${theme === "dark" ? "text-gray-400" : "text-gray-400"
                    }`}
                />

                <input
                  type="email"
                  {...loginRegister("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-transparent text-sm font-medium focus:outline-none ${theme === "dark"
                      ? "text-white placeholder-gray-500"
                      : "text-gray-900 placeholder-gray-400"
                    }`}
                  placeholder="Email"
                />
              </div>

              {loginErrors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#00a884] hover:bg-[#008f6f] active:bg-[#007a5e] text-white font-medium py-3 px-4 rounded-xl shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {loading ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        )}


        {step === 2 && (
          <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
            <p
              className={`text-sm text-center leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
            >
              Please enter the 6-digit OTP sent to{" "}
              {userPhoneData?.email ? "your email " : "your phone "}
              <span className="font-semibold text-[#00a884]">
                {userPhoneData?.email ||
                  `${userPhoneData?.phoneSuffix || ""} ${userPhoneData?.phoneNumber || ""}`.trim()}
              </span>
            </p>

            <div className="flex justify-between gap-1.5 sm:gap-2 my-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold font-mono border rounded-xl focus:outline-none transition-all shadow-2xs ${otpErrors.otp
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : theme === "dark"
                        ? "border-gray-700 bg-gray-800/80 text-white focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20"
                        : "border-gray-200 bg-gray-50/70 text-gray-900 focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 focus:bg-white"
                    }`}
                />
              ))}
            </div>

            {otpErrors.otp && (
              <p className="text-red-500 text-xs text-center font-medium">
                {otpErrors.otp.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00a884] hover:bg-[#008f6f] active:bg-[#007a5e] text-white font-medium py-3 px-4 rounded-xl shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {loading ? <Spinner /> : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className={`w-full py-2.5 px-4 text-sm font-medium transition-colors rounded-xl flex items-center justify-center gap-2 cursor-pointer ${theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <FaArrowLeft className="text-xs mr-1" />
              {userPhoneData?.email ? "Wrong email? Go back" : "Wrong number? Go back"}
            </button>
          </form>
        )}


        {step === 3 && (
          <form
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            <div className="flex flex-col items-center mb-2">
              <div className="relative w-24 h-24 mb-3">
                <img
                  src={profilePicture || selectedAvatar}
                  alt="profile"
                  className={`w-24 h-24 rounded-full object-cover ring-4 ${theme === "dark" ? "ring-gray-700" : "ring-gray-100"
                    } shadow-sm`}
                />

                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all duration-200 hover:scale-105"
                  title="Upload picture"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                </label>

                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <p
                className={`text-xs font-medium uppercase tracking-wider mb-2.5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Choose an avatar
              </p>

              <div className="w-full flex flex-row flex-wrap justify-center gap-2.5 mb-4">
                {avatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className={`w-11 h-11 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 ${selectedAvatar === avatar
                        ? "ring-2 ring-[#00a884] ring-offset-2 " +
                        (theme === "dark"
                          ? "ring-offset-gray-900"
                          : "ring-offset-white")
                        : "opacity-80 hover:opacity-100"
                      }`}
                    onClick={() => setSelectedAvatar(avatar)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div>
                <div
                  className={`flex items-center rounded-xl border transition-all px-3.5 py-3 ${profileErrors.username
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : theme === "dark"
                        ? "border-gray-700 bg-gray-800/60 focus-within:border-[#00a884] focus-within:ring-2 focus-within:ring-[#00a884]/20"
                        : "border-gray-200 bg-gray-50/60 focus-within:border-[#00a884] focus-within:ring-2 focus-within:ring-[#00a884]/20 focus-within:bg-white"
                    }`}
                >
                  <FaUser
                    className={`mr-2.5 text-sm shrink-0 ${theme === "dark" ? "text-gray-400" : "text-gray-400"
                      }`}
                  />
                  <input
                    type="text"
                    {...profileRegister("username")}
                    placeholder="Username"
                    className={`w-full bg-transparent text-sm font-medium focus:outline-none ${theme === "dark"
                        ? "text-white placeholder-gray-500"
                        : "text-gray-900 placeholder-gray-400"
                      }`}
                  />
                </div>
                {profileErrors.username && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">
                    {profileErrors.username.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  {...profileRegister("agreedToTerms")}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#00a884] accent-[#00a884] focus:ring-[#00a884] cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className={`text-xs leading-relaxed cursor-pointer select-none ${theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-[#00a884] hover:underline font-medium"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>

              {profileErrors.agreedToTerms && (
                <p className="text-red-500 text-xs font-medium">
                  {profileErrors.agreedToTerms.message}
                </p>
              )}

              <button
                type="submit"
                disabled={!watch("agreedToTerms") || loading}
                className="w-full mt-2 bg-[#00a884] hover:bg-[#008f6f] active:bg-[#007a5e] text-white font-medium py-3 px-4 rounded-xl shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? <Spinner /> : "Create Profile"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default Login
