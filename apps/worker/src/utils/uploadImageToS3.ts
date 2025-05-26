import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { generalConfig } from "@repo/lib/src";
import { getPresignedUrl } from "./getS3Url";

const s3 = new S3Client({ 
  region: generalConfig.S3REGION, 
  credentials: {
    accessKeyId: process.env.ACCESSKEYID || "",
    secretAccessKey: process.env.SECRETACCESSKEY || "",
  },
}); 

function generateS3Key(filename: string): string {
  const ext = path.extname(filename);
  const id = uuidv4();
  return `processed-pages/${id}${ext}`;
}

export async function uploadImageToS3(filePath: string): Promise<string | null> {
  try {
    const fileStream = createReadStream(filePath);
    const s3Key = generateS3Key(filePath);
    
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.BUCKETNAME,
        Key: s3Key,
        Body: fileStream,
      },
    });

    await upload.done();
    console.log(`Upload successful for key: ${s3Key}`);
    

    const presignedUrl = await getPresignedUrl(s3Key,600000);
    return presignedUrl;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
}
