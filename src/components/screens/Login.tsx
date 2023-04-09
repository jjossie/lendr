import React, {useState} from 'react';
import {Button, Center, Column, FormControl, Input, ScrollView, Text} from 'native-base';
import {signInUser} from "../../controllers/auth";
import {NativeStackScreenProps} from "@react-navigation/native-stack";

export interface LoginProps {

}

const Login: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signIn = async () => {
    console.log("Trying to sign in");
    signInUser(email, password);
  };

  return (
      <ScrollView>
        <Center h="100%" w="100%">
          <Column w={80} space={4}>
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

            <Button onPress={signIn}>Sign In</Button>
            <Text>No account?</Text>
            <Button
                onPress={() => {
                  navigation.navigate("Register");
                }}
                variant="outline">Register</Button>
          </Column>
        </Center>
      </ScrollView>
  );
};

export default Login;