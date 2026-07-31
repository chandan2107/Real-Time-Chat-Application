import axios from "axios"


const apiURL=`${import.meta.env.VITE_API_URL}/api`

const axiosInstance=axios.create({
    baseURL:apiURL,
    withCredentials:true
})


export {axiosInstance}