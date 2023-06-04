import React, {useState} from 'react';
import {Button, Center, DeleteIcon, IconButton, Image, theme} from 'native-base';
import * as ImagePicker from "expo-image-picker";

export interface ImagePickerProps {
  onSelectImage: (_: any) => Promise<any>;
  onRemoveImage: (_: any) => Promise<any>;
  existingImageUrl?: string | undefined;
}

const ToolImagePicker: React.FC<ImagePickerProps> = ({onSelectImage, onRemoveImage, existingImageUrl}) => {

  // State
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [isLoading,  setIsLoading] = useState<boolean>(false);
  const [hasUserChangedImage, setHasUserChangedImage] = useState<boolean>(false);

  // Callbacks
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setIsLoading(true);
      setSelectedImage(result.assets[0].uri);
      await onSelectImage(result.assets[0].uri);
      setIsLoading(false);
    } else {
      alert('You did not select any image.');
    }
  };

  const handleOnRemoveImage = async () => {
    setIsLoading(true);
    await onRemoveImage(selectedImage);
    setIsLoading(false);
  };

  if (existingImageUrl && !hasUserChangedImage){
    console.log("Using existing image: ", existingImageUrl);
    setSelectedImage(existingImageUrl);
    setHasUserChangedImage(true);
  }else
    console.log("Not using existing image: ", existingImageUrl);

  console.log("Selected Image: " + selectedImage);

  return (
      <Center w={"100%"} h={320}>
        {
          selectedImage
              ? <Center w="100%" h="100%">
                <Image source={{uri: selectedImage}} w="100%" h="100%" alt={selectedImage}/>
                <Button isLoading={isLoading}
                        isLoadingText={"Uploading"}
                        onPress={pickImageAsync}>Change Image</Button>
                <IconButton variant={"solid"}
                            bgColor={theme.colors.error["500"]}
                            icon={<DeleteIcon/>}
                            disabled={isLoading}
                            onPress={handleOnRemoveImage}/>
              </Center>

              : <Center w="100%" h="100%" bgColor={theme.colors.light["100"]}>
                <Button
                    isLoading={isLoading}
                    isLoadingText={"Uploading"}
                    variant="outline"
                    onPress={pickImageAsync}
                    w="50%"
                    h={12}>Pick an Image</Button>
              </Center>
        }
      </Center>
  );
};

export default ToolImagePicker;