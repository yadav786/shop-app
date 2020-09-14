import React, { useState, useReducer, useCallback, useEffect } from 'react';
import { ScrollView, Button, KeyboardAvoidingView, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';

import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors';

import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';

import * as authActions from '../../store/actions/auth';


const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues
    };
  }
  return state;
};


const AuthScreen = props => {

    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();

    const dispatch = useDispatch();

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
          email:  '',
          password: ''
        },
        inputValidities: {
            email: false,
            password: false
        },
        formIsValid: false
      });


      useEffect(() => {
            if(error){
                alert(error);
                Alert.alert('An error occured!', error, [{ text: 'Okay' }]);
            }
      }, [error]);

    const authHandler = async() => {
        setLoading(true);
        let action;
        if(isSignUp){
            action = authActions.signUp(formState.inputValues.email, formState.inputValues.password);
        }
        else{
            action = authActions.login(formState.inputValues.email, formState.inputValues.password);
        }
        try{
            setError(null);
            await dispatch(action);
            props.navigation.navigate('Shop');
        }
        catch(err){
            setError(err.message);
            setLoading(false);
        }
    }

    const inputChangeHandler = useCallback((inputIdentifier, inputValue, inputValidity) => { 
        console.log(inputIdentifier, inputValue, inputValidity);
        dispatchFormState({
          type: FORM_INPUT_UPDATE,
          value: inputValue,
          isValid: inputValidity,
          input: inputIdentifier
        });
    }, [dispatchFormState]);


    const switchHandler = () => {
        setIsSignUp(!isSignUp);
    }

    return(
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={50} style={styles.screen}>
            <LinearGradient colors={['#ffedff', '#ffe3ff']} style={styles.gradient}>
            <Card styles={styles.authContainer}>
                <ScrollView>
                        <Input 
                            id="email" 
                            label="E-Mail"
                            keyboardType="email-address"
                            required
                            email
                            autoCapitalize="none"
                            errorText="Please enter a valid email address"
                            onInputChange={inputChangeHandler}
                            initialValue={formState.inputValues.email}
                        />
                           <Input 
                            id="password" 
                            label="Password"
                            keyboardType="default"
                            secureTextEntry
                            required
                            minLength={5}
                            autoCapitalize="none"
                            errorText="Please enter a valid password"
                            onInputChange={inputChangeHandler}
                            initialValue={formState.inputValues.password}
                        />
                        <View style={styles.buttonContainer}>
                        { loading ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                         ) : ( 
                            <Button title={ isSignUp ? "Sign Up" : "Login"}  color={Colors.primary} onPress={authHandler}/>
                         )}
                        </View>
                        <View style={styles.buttonContainer}>
                        <Button title={`Switch to ${isSignUp ? 'Login': 'Sign Up'} `}  color={Colors.accent} onPress={switchHandler}/>
                        </View>
                </ScrollView>
            </Card>
            </LinearGradient>
        </KeyboardAvoidingView>
    )

}

AuthScreen.navigationOptions = {
    headerTitle: 'Authenticate'
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    authContainer: {
        width: '80%',
        maxWidth: 400,
        maxHeight: 400,
        padding: 20
    },
    buttonContainer: {
        marginTop: 10
    }
});

export default AuthScreen;
