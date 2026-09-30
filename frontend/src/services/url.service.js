import axios from "axios"


const apiURL=`${import.meta.env.VITE_API_URL}/api`

const getToken=()=> localStorage.getItem("auth_token")

const axiosInstance=axios.create({
    baseURL:apiURL,
    //withCredentials:true
})

axiosInstance.interceptors.request.use((config)=>{
    const token=getToken()
    if(token){
        config.headers.Authorization=`Bearer ${token}`
    }
    return config
})


export {axiosInstance}