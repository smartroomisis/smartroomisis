import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BucketName = "audit-photos" | "payment-proofs" | "invoices";

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload a file to Supabase Storage
   * @param bucket - The bucket name (audit-photos, payment-proofs, invoices)
   * @param file - The file to upload
   * @param folder - Optional folder path within the bucket
   * @returns Upload result with public URL
   */
  const uploadFile = async (
    bucket: BucketName,
    file: File,
    folder?: string
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer upload";
      console.error("Upload failed:", err);
      return { success: false, error: message };
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Upload multiple files to Supabase Storage
   * @param bucket - The bucket name
   * @param files - Array of files to upload
   * @param folder - Optional folder path
   * @returns Array of upload results
   */
  const uploadFiles = async (
    bucket: BucketName,
    files: File[],
    folder?: string
  ): Promise<UploadResult[]> => {
    setIsUploading(true);
    setUploadProgress(0);

    const results: UploadResult[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(bucket, files[i], folder);
      results.push(result);
      setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    setIsUploading(false);
    return results;
  };

  /**
   * Convert base64 string to File object
   */
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  /**
   * Upload base64 images to storage
   * @param bucket - The bucket name
   * @param base64Images - Array of base64 image strings
   * @param folder - Optional folder path
   * @returns Array of public URLs
   */
  const uploadBase64Images = async (
    bucket: BucketName,
    base64Images: string[],
    folder?: string
  ): Promise<string[]> => {
    const urls: string[] = [];

    for (let i = 0; i < base64Images.length; i++) {
      const file = base64ToFile(base64Images[i], `image-${i}.jpg`);
      const result = await uploadFile(bucket, file, folder);
      if (result.success && result.url) {
        urls.push(result.url);
      }
    }

    return urls;
  };

  /**
   * Get a short-lived signed URL for a file in a private bucket.
   * Accepts either a storage path or a previously stored URL (path is extracted).
   */
  const getSignedUrl = async (
    bucket: BucketName,
    pathOrUrl: string,
    expiresInSeconds = 3600
  ): Promise<string | null> => {
    try {
      // Extract the storage path if a full URL was stored
      let path = pathOrUrl;
      const marker = `/object/public/${bucket}/`;
      const signedMarker = `/object/sign/${bucket}/`;
      if (pathOrUrl.includes(marker)) {
        path = pathOrUrl.split(marker)[1].split("?")[0];
      } else if (pathOrUrl.includes(signedMarker)) {
        path = pathOrUrl.split(signedMarker)[1].split("?")[0];
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error) {
        console.error("Signed URL error:", error);
        return null;
      }
      return data.signedUrl;
    } catch (err) {
      console.error("Signed URL failed:", err);
      return null;
    }
  };

  /**
   * Delete a file from storage
   */
  const deleteFile = async (bucket: BucketName, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) {
        console.error("Delete error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Delete failed:", err);
      return false;
    }
  };

  return {
    uploadFile,
    uploadFiles,
    uploadBase64Images,
    deleteFile,
    base64ToFile,
    isUploading,
    uploadProgress,
  };
}
