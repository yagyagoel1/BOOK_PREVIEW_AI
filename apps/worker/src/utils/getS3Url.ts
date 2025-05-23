import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generalConfig } from "@repo/lib/src";

const s3 = new S3Client({ region: generalConfig.S3REGION , credentials: {
      accessKeyId:process.env.ACCESSKEYID||"",
      secretAccessKey:process.env.SECRETACCESSKEY||"",
    },}); 


export async function getPresignedUrl( key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKETNAME,
    Key: key,
  });


  const url = await getSignedUrl(s3, command, { expiresIn: 900 });

  return url;
}
