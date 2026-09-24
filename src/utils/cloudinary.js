import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


    const removeTempFile = (filePath) => {
      try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (error) {
        console.error("temporary file cleanup failed:", error.message);
      }
    };

    const uploadONCloudinary = async (localFilePath)=>{
        if(!localFilePath) return null;
        cloudinary.config({
            cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret:process.env.CLOUDINARY_API_SECRET
        });
        try {
                //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto",
                timeout: 120000
            })
            //file has been uploaded sucessfully
          //  console.log("file is uploaded on cloudinary",
            //    response.url);
            removeTempFile(localFilePath);
                return response;
            
            
        } catch (error) {
            removeTempFile(localFilePath)
            console.error("Cloudinary upload failed:", error?.message || "unknown error");
            return null;
        }
    }

    const uploadVideoONCloudinary = async (localFilePath) => {
      if (!localFilePath) return null;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      try {
        const response = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_large(localFilePath, {
            resource_type: "video",
            chunk_size: 6 * 1024 * 1024,
            timeout: 120000
          }, (error, result) => error ? reject(error) : resolve(result));
        });
        removeTempFile(localFilePath);
        return response;
      } catch (error) {
        removeTempFile(localFilePath);
        console.error("Cloudinary video upload failed:", error?.message || "unknown error");
        return null;
      }
    };


    const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    // delete from cloudinary
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Response: ", response);
    console.log("file delete successfully from cloudinar");

    return response;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
    
export { uploadONCloudinary, uploadVideoONCloudinary, deleteFromCloudinary}
