import {create} from "zustand"
import {persist} from "zustand/middleware"


const useUserStore=create(
    persist((set)=>({
            user:null,
            isAuthenticated:false,
            setUser:(userData)=>set({user:userData,isAuthenticated:true}),
            clearUser:()=>set({user:null,isAuthenticated:false}),
        }),
        {
            name:"login-storage",
            getStorage:()=>localStorage

        }
        
    )
) 


const useThemeStore=create(
    persist((set)=>({
            theme:"light",
            setTheme:(theme)=>set({theme})
    }),
        {
            name:"theme-storage",
            getStorage:()=>localStorage

        }
        
    )
)

export {useUserStore,useThemeStore}