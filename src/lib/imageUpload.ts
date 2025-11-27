import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

const PLANTS_BUCKET = Constants.expoConfig?.extra?.supabaseStorageBucketPlants || process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET_PLANTS || 'plants';

/**
 * Gets the file extension from URI
 */
function getFileExtension(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  return extension || 'jpg';
}

/**
 * Requests permission to access the image library
 */
export async function requestImageLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Requests permission to access the camera
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Opens the image picker and returns the selected image
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerResult> {
  const hasPermission = await requestImageLibraryPermission();
  if (!hasPermission) {
    throw new Error('Permission to access image library was denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  return result;
}

/**
 * Takes a picture using the camera and returns the captured image
 */
export async function takePicture(
  aspect: [number, number] = [1, 1]
): Promise<ImagePicker.ImagePickerResult> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Permission to access camera was denied');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });

  return result;
}

/**
 * Uploads an image to Supabase storage
 * @param uri - The local file URI
 * @param plantId - The plant ID to associate the image with
 * @returns The public URL of the uploaded image
 */
export async function uploadPlantImage(
  uri: string,
  plantId: string
): Promise<string> {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Read the file using expo-file-system legacy API
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer for Supabase
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Generate a unique filename
    const fileExtension = getFileExtension(uri);
    const fileName = `${user.id}/${plantId}/${Date.now()}.${fileExtension}`;

    // Upload to Supabase storage (Supabase will validate the file type)
    const { data, error } = await supabase.storage
      .from(PLANTS_BUCKET)
      .upload(fileName, byteArray, {
        contentType: "image/*",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(PLANTS_BUCKET).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Deletes an image from Supabase storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deletePlantImage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf(PLANTS_BUCKET);
    if (bucketIndex === -1) {
      throw new Error('Invalid image URL');
    }
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    // Delete from Supabase storage
    const { error } = await supabase.storage
      .from(PLANTS_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

