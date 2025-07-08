import React, {useState} from 'react';
import {Button, Center, Column, FormControl, Input, ScrollView} from 'native-base';
import {registerUser} from "../../controllers/auth";
import {NativeStackScreenProps} from "@react-navigation/native-stack";

const Login: React.FC<NativeStackScreenProps<any>> = ({navigation, route}) => {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [password, setPassword] = useState(route.params?.password ?? "");

  const handleLogIn = async () => {
    navigation.navigate("Login", {email, password})
  };

  const handleRegister = async () => {
    console.log("Trying to register new user");
    registerUser(firstName, lastName, email, password);
  };


  return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <Center h="100%" w="100%" py={12}>
          <Column w={80} space={4}>

            {/* Name Entry */}
            <FormControl isRequired>
              <FormControl.Label>First Name</FormControl.Label>
              <Input
                  onChangeText={value => {
                    setFirstName(value);
                  }}
                  size="lg"
                  variant="filled"
                  value={firstName}
                  placeholder="Jane"/>
            </FormControl>
            <FormControl isRequired>
              <FormControl.Label>Last Name</FormControl.Label>
              <Input
                  onChangeText={value => {
                    setLastName(value);
                  }}
                  size="lg"
                  variant="filled"
                  placeholder="Doe"
                  value={lastName}/>
            </FormControl>

            {/* Email & Password Entry */}
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
                  value={password}/>
            </FormControl>

            <Button size="lg" onPress={handleRegister} variant="solid">Register</Button>
            <Button size="lg" onPress={handleLogIn} variant="outline">Sign In</Button>
          </Column>
        </Center>
      </ScrollView>
  );
};

export default Login;