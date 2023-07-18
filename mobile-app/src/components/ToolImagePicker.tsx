import React, {useEffect, useState} from 'react';
import {Button, Center, Column, DeleteIcon, IconButton, Image, Row, theme} from 'native-base';
import * as ImagePicker from "expo-image-picker";
import {ImagePickerOptions, PermissionStatus} from "expo-image-picker";
import {LendrBaseError} from "../utils/errors";
import Carousel from "./utilities/Carousel";

export interface ImagePickerProps {
  onSelectImage: (_: any, index?: number) => Promise<any>;
  onRemoveImage: (_: any, index?: number) => Promise<any>;
  existingImageUrl?: string | undefined;
  existingImageUrls?: string[];
}

const ToolImagePicker: React.FC<ImagePickerProps> = ({
                                                       onSelectImage,
                                                       onRemoveImage,
                                                       existingImageUrl,
                                                       existingImageUrls,
                                                     }) => {

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

    if (!result.canceled) { // Handle case where cameras can only return one at a time
      setIsLoading(true);
      // setSelectedImage(result.assets[0].uri);
      setSelectedImages(result.assets.map((asset) => asset.uri));

      let promises: Promise<any>[] = [];
      result.assets.forEach((asset, index) => {
        console.log(`✳️I promise I'll add ${asset.uri}`);
        promises.push(onSelectImage(asset.uri, index));
      });
      await Promise.all(promises);
      setIsLoading(false);
    } else {
      alert("You did not select any image.");
    }
  };

  const handleOnRemoveImage = async (index = 0) => {
    setIsLoading(true);
    try {
      await onRemoveImage(selectedImages[index], index);
      console.log("❇️Before removing image: ", selectedImages);
      setSelectedImages(images => images.filter(img => img !== selectedImages[index]));
      console.log("❇️Removed image: ", selectedImages);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  if (existingImageUrls?.length && existingImageUrls.length > 0 && !hasUserChangedImage) {
    console.log("❇️Using existing images: ", existingImageUrls);
    setSelectedImages(existingImageUrls);
    setHasUserChangedImage(true);
  }
  // console.log("Not using existing image: ", existingImageUrl);

  // console.log("Selected Image: " + selectedImage);

  return (
      <Center w={"100%"} h={320}>
        {
          (selectedImages && selectedImages.length > 0)
              ? <Center w="100%" h="100%">

                <Carousel items={selectedImages.map((imageUrl, index) => {
                  return (<Column w={"100%"} alignItems={"flex-end"}>
                    <Image source={{uri: imageUrl}} w="100%" h={280} alt={imageUrl}/>
                    <IconButton
                        translateX={-20}
                        variant={"solid"}
                        bgColor={theme.colors.error["500"]}
                        icon={<DeleteIcon/>}
                        disabled={isLoading}
                        onPress={async () => {
                          await handleOnRemoveImage(index);
                        }}/>
                  </Column>);
                })} itemsPerInterval={1} variant={"slides"}/>
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