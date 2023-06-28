import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {LendrBaseError} from "../utils/errors";

export const uploadToolImageToFirebase = async (localImageUri: string, toolId: string, index: number = 0) => {
  if (!localImageUri) throw new LendrBaseError("Cannot upload image to Firebase without a local image URI")
  if (!toolId) throw new LendrBaseError("Cannot upload image to Firebase without a tool ID")

  try {
    console.log("🗃️uploadToolImageToFirebase");
    const storage = getStorage();
    // Get file blob from device
    const response = await fetch(localImageUri);
    console.log("🗃️Device file: ", JSON.stringify(response.url));
    const blob = await response.blob();

    // Get Image Reference
    const imageRef = ref(storage, getStorageUrlForToolImage(toolId));
    console.log("🗃imageRef: ", JSON.stringify(imageRef.fullPath));

    // Upload file to Firebase Storage
    const uploadResult = await uploadBytes(imageRef, blob);
    console.log("🗃uploadResult: ", JSON.stringify(uploadResult.metadata.fullPath));

    // Get the public download URL of the uploaded image
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    console.log("🗃downloadUrl: ", downloadUrl);

    return downloadUrl;

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

const getRandomUuid = () => {
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${randomNumber}`;
}