import React, {useState} from 'react';
import {Button, Center, Column, FormControl, Input, ScrollView} from 'native-base';
import {logInUser} from "../../controllers/auth";
import {NativeStackScreenProps} from "@react-navigation/native-stack";

const Login: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {

  const [email, setEmail] = useState(route.params?.email ?? "");
  const [password, setPassword] = useState(route.params?.password ?? "");

  const handleLogIn = async () => {
    console.log("Trying to sign in");
    logInUser(email, password);
  };

  const handleRegister = async () => {
    navigation.navigate("Register", {email, password});
  };


  return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <Center h="100%" w="100%" py={12}>
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

            <Button size="lg" onPress={handleLogIn} variant="solid">Sign In</Button>
            <Button size="lg" onPress={handleRegister} variant="outline">Register</Button>
          </Column>
        </Center>
      </ScrollView>
  );
};

export default Login;