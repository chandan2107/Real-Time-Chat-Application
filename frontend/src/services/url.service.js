import axios from "axios"


const apiURL=`${process.env.API_URL}/api`

const axiosInstance=axios.create({
    baseURL:apiURL,
    withCredentials:true
})


export {axiosInstance}