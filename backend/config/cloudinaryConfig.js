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
    const isVideo = file.mimetype.startsWith("video");
    const options={
        resource_type: isVideo ? "video" : "image"
    }

    try {
        if (isVideo) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(file.path, options, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
            });
            return result;
        } else {
            const result = await cloudinary.uploader.upload(file.path, options);
            return result;
        }
    } finally {
        if (file.path && fs.existsSync(file.path)) {
            fs.unlink(file.path, () => {});
        }
    }
}


const multerMiddleware = multer({dest:"uploads/"}).single("media")


export {uploadFileToCloudinary,multerMiddleware}


