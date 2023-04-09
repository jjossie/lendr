import React, {useState} from 'react';
import {Button, Center, Column, FormControl, Input, ScrollView, Text} from 'native-base';
import {createUser} from "../../controllers/auth";
import {NativeStackScreenProps} from "@react-navigation/native-stack";

const Register: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    console.log("Trying to register new user");
    createUser(email, password);
  };

  return (
      <ScrollView>
        <Center h="100%" w="100%">
          <Column w={80} space={4}>
            {/* Basic Text Input */}
            <FormControl isRequired>
              <FormControl.Label>Email</FormControl.Label>
              <Input
                  onChangeText={value => {
                    setEmail(value);
                  }}
                  size="lg"
                  variant="filled"
                  value={email}
                  placeholder="jane.doe@example.com"/>
            </FormControl>
            <FormControl isRequired>
              <FormControl.Label>Password</FormControl.Label>
              <Input
                  onChangeText={value => {
                    setPassword(value);
                  }}
                  size="lg"
                  variant="filled"
                  type="password"
                  value={password}
              />
            </FormControl>

            <Button onPress={handleRegister}>Create User</Button>
            <Text>Have an account?</Text>
            <Button
                onPress={() => {
                  navigation.navigate("Login");
                }}
                variant="outline">Sign In</Button>
          </Column>
        </Center>
      </ScrollView>
  );
};

export default Register;