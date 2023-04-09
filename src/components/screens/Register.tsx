import React, {useState} from 'react';
import {Button, Center, Column, FormControl, Input} from 'native-base';
import {createUser} from "../../controllers/auth";


export interface RegisterProps {

}

const Register: React.FC<RegisterProps> = (props: RegisterProps) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async () => {
    console.log("Trying to register new user");
    createUser(email, password);
  };

  return (
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
        </Column>
      </Center>
  );
};

export default Register;