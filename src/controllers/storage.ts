import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";

export const uploadToolImageToFirebase = async (uri: string, toolId: string, index: number = 0) => {
  try {

    const storage = getStorage();
    // Get file blob from device
    const response = await fetch(uri);
    const blob = await response.blob();

    // Get Image Reference
    const imageRef = ref(storage, getStorageUrlForToolImage(toolId, index));

    // Upload file to Firebase Storage
    const uploadResult = await uploadBytes(imageRef, blob);

    // Get the public download URL of the uploaded image
    return getDownloadURL(uploadResult.ref);

  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    return null;
  }
};

export const deleteToolImageFromFirebase = async (toolId: string, index: number = 0) => {
  try {

    const storage = getStorage();

    const imageRef = ref(storage, getStorageUrlForToolImage(toolId, index));

    await deleteObject(imageRef);

  } catch (error) {
    console.error('Error deleting image from Firebase:', error);
  }
};

const getStorageUrlForToolImage = (toolId: string, index: number = 0) => {
  return `toolImages/${toolId}/img_${index}`;
}