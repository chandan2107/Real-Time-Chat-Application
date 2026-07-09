import multer from "multer"
import { v2 as cloudinary} from "cloudinary"
import "dotenv/config"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadFileToCloudinary= async (file)=>{
    if (!file) {
        throw new Error("No file provided");
    }
    const options={
        resource_type:file.mimetype.startsWith("video")? "video":"image"
    }

    try {
        const uploader = file.mimetype.startsWith("video")
            ? cloudinary.uploader.upload_large
            : cloudinary.uploader.upload;

        const result = await uploader(file.path, options);

        return result;
    } finally {
        
        fs.unlink(file.path, () => {});
    }


    
}


const multerMiddleware = multer({dest:"uploads/"}).single("media")


export {uploadFileToCloudinary,multerMiddleware}


