import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { deleteLocalImage, LOCAL_IMAGE_PREFIX, writeLocalImage } from "./local-images";

const r2Values = [process.env.R2_ACCOUNT_ID, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY, process.env.R2_BUCKET_NAME];
const hasR2Settings = r2Values.some((value) => Boolean(value?.trim()));
const client = r2Values.every((value) => Boolean(value?.trim())) ? new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
}) : null;
const bucket = process.env.R2_BUCKET_NAME || "prompt-images";

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  if (!client) {
    if (hasR2Settings) throw new Error("R2 이미지 저장소 설정이 일부 누락되었습니다.");
    return writeLocalImage(key, body);
  }
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  return key;
}

export async function deleteObject(key: string) {
  if (key.startsWith(LOCAL_IMAGE_PREFIX)) return deleteLocalImage(key.slice(LOCAL_IMAGE_PREFIX.length));
  if (client) await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function signedImageUrl(key: string) {
  if (key.startsWith(LOCAL_IMAGE_PREFIX)) {
    return "/api/images/" + key.slice(LOCAL_IMAGE_PREFIX.length).split("/").map(encodeURIComponent).join("/");
  }
  if (!client) return null;
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 300 });
}
