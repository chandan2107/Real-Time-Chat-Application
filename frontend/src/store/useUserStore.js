import {create} from "zustand"
import {persist} from "zustand/middleware"


const useUserStore=create(
    persist((set)=>({
            user:null,
            isAuthenticated:false,
            setUser:(userData)=>set({user:userData,isAuthenticated:true}),
            clearUser:()=>set({user:null,isAuthenticatedfalse}),
        }),
        {
            name:"login-storage",
            getStorage:()=>localStorage

        }
        
    )
) 

export {useUserStore}