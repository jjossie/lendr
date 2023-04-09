import React, {useState} from 'react';
import {Button, Center, Column, FormControl, Input} from 'native-base';
import {signInUser} from "../../controllers/auth";

export interface LoginProps {

}

const Login: React.FC<LoginProps> = (props: LoginProps) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signIn = async () => {
    console.log("Trying to sign in");
    signInUser(email, password);
  };

  return (
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
        </Column>
      </Center>
  );
};

export default Login;