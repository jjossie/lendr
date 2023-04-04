import React, {useState} from 'react';
import {Button, Center, Column, FormControl, Input} from 'native-base';


// import auth from '@react-native-firebase/auth';

// function createUser(email: string, password: string) {
//   auth()
//       .createUserWithEmailAndPassword(email, password)
//       .then(() => {
//         console.log('User account created & signed in!');
//       })
//       .catch(error => {
//         if (error.code === 'auth/email-already-in-use') {
//           console.log('That email address is already in use!');
//         }
//
//         if (error.code === 'auth/invalid-email') {
//           console.log('That email address is invalid!');
//         }
//         console.error(error);
//       });
// }
//

export interface LoginProps {

}

const Login: React.FC<LoginProps> = (props: LoginProps) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signIn = () => {
    console.log("Trying to sign in");
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
                placeholder="SuperSecretPassword!"/>
          </FormControl>

          <Button onPress={signIn}>Create User</Button>
        </Column>
      </Center>
  );
};

export default Login;