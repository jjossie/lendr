import React, {useEffect, useState} from 'react';
import {Button, Center, DeleteIcon, IconButton, Image, Row, theme} from 'native-base';
import * as ImagePicker from "expo-image-picker";
import {ImagePickerOptions, PermissionStatus} from "expo-image-picker";
import {LendrBaseError} from "../utils/errors";

export interface ImagePickerProps {
  onSelectImage: (_: any) => Promise<any>;
  onRemoveImage: (_: any) => Promise<any>;
  existingImageUrl?: string | undefined;
}

const ToolImagePicker: React.FC<ImagePickerProps> = ({onSelectImage, onRemoveImage, existingImageUrl}) => {

  // State
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUserChangedImage, setHasUserChangedImage] = useState<boolean>(false);

  // Permissions
  const [cameraPermissionStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [galleryPermissionStatus, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();

  // Side Effects
  useEffect(() => {
    if (cameraPermissionStatus?.status === PermissionStatus.UNDETERMINED) {
      setIsLoading(true);
      requestCameraPermission().then(() => setIsLoading(false));
    }

    if (galleryPermissionStatus?.status === PermissionStatus.UNDETERMINED) {
      setIsLoading(true);
      requestGalleryPermission().then(() => setIsLoading(false));
    }
  }, []);

  const imagePickerOptions: ImagePickerOptions = {
    allowsEditing: false,
    allowsMultipleSelection: true,
    quality: 0.9,
    selectionLimit: 5,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  };

  // Callbacks
  const pickImage = async (type: "camera" | "gallery") => {
    let result;
    switch (type) {
      case "gallery":
        result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
        break;
      case "camera":
        result = await ImagePicker.launchCameraAsync(imagePickerOptions);
        break;
      default:
        throw new LendrBaseError('Invalid image picker type');
    }

    if (!result.canceled) {
      setIsLoading(true);
      // setSelectedImage(result.assets[0].uri);
      setSelectedImages(result.assets.map((asset) => asset.uri));
      await onSelectImage(result.assets[0].uri);
      setIsLoading(false);
    } else {
      alert("You did not select any image.");
    }
  };

  const handleOnRemoveImage = async () => {
    setIsLoading(true);
    try {
      await onRemoveImage(selectedImage);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
    setIsLoading(false);
  };

  if (existingImageUrl && !hasUserChangedImage) {
    console.log("❇️Using existing image: ", existingImageUrl);
    setSelectedImage(existingImageUrl);
    setHasUserChangedImage(true);
  }
  // console.log("Not using existing image: ", existingImageUrl);

  // console.log("Selected Image: " + selectedImage);

  return (
      <Center w={"100%"} h={320}>
        {
          selectedImage
              ? <Center w="100%" h="100%">
                <Image source={{uri: selectedImage}} w="100%" h="100%" alt={selectedImage}/>
                <Row w="100%" space={2} p={2} justifyContent={"flex-end"}>
                  <Button isLoading={isLoading}
                          // isLoadingText={"Uploading"}
                          variant={"subtle"}
                          onPress={async () => {
                            await pickImage("gallery");
                          }}>Change Photo</Button>
                  <Button isLoading={isLoading}
                          // isLoadingText={"Uploading"}
                          variant={"subtle"}
                          onPress={async () => {
                            await pickImage("camera");
                          }}>Take Photo</Button>
                  <IconButton variant={"solid"}
                              bgColor={theme.colors.error["500"]}
                              icon={<DeleteIcon/>}
                              disabled={isLoading}
                              onPress={handleOnRemoveImage}/>
                </Row>
              </Center>

              : <Center w="100%" h="100%" bgColor={theme.colors.light["100"]}>
                <Button
                    isLoading={isLoading}
                    isLoadingText={"Uploading"}
                    variant="outline"
                    onPress={async () => {
                      await pickImage("gallery");
                    }}
                    w="50%"
                    h={12}>Choose Photo</Button>
                <Button
                    isLoading={isLoading}
                    isLoadingText={"Uploading"}
                    variant="outline"
                    onPress={async () => {
                      await pickImage("camera");
                    }}
                    w="50%"
                    h={12}>Take Photo</Button>
              </Center>
        }
      </Center>
  );
};

export default ToolImagePicker;