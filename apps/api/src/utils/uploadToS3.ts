import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { generalConfig } from "@repo/lib/src";





function generateS3Key(filePath: string,id:string): string {
  const ext = path.extname(filePath);
  return `useruploads/${id}${ext}`;
}

const s3 = new S3Client({ region: generalConfig.S3REGION , credentials: {
      accessKeyId:process.env.ACCESSKEYID||"",
      secretAccessKey:process.env.SECRETACCESSKEY||"",
    },}); 

export async function uploadToS3(filePath: string) {
  const fileStream = createReadStream(filePath);
    //trust uuid else check if the same uuid exist in the bucket :) yagya 
  const id = uuidv4()
  const s3Key = generateS3Key(filePath,id);
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.BUCKETNAME,
      Key: s3Key,
      Body: fileStream,
    },
  });

  try {
    await upload.done();
    console.log(`Upload successful`);

    return s3Key
  } catch (err) {
    console.error("Upload failed:", err);
    return null
  }
}
