import {deleteObject, getDownloadURL, getStorage, putFile, ref, uploadBytes} from "@react-native-firebase/storage";
import {LendrBaseError} from "../utils/errors";

export const uploadToolImageToFirebase = async (localImageUri: string, toolId: string, index: number = 0) => {
  if (!localImageUri) throw new LendrBaseError("Cannot upload image to Firebase without a local image URI")
  if (!toolId) throw new LendrBaseError("Cannot upload image to Firebase without a tool ID")

  try {
    console.log("🗃️uploadToolImageToFirebase");
    const storage = getStorage();
    // Get file blob from device
    const response = await fetch(localImageUri);
    if (!response.ok) {
      throw new LendrBaseError(`Failed to fetch image from device: ${response.statusText}`);
    }

    // Get Image Reference
    const imageRef = ref(storage, getStorageUrlForToolImage(toolId, index));
    console.log("🗃imageRef: ", JSON.stringify(imageRef.fullPath));
    
    // Upload file to Firebase Storage
    const uploadTask = await putFile(imageRef, localImageUri);
    console.log("🗃uploadTask: ", uploadTask);

    // Get the public download URL of the uploaded image
    const downloadUrl = await getDownloadURL(imageRef);
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