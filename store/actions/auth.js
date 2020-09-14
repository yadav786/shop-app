import { AsyncStorage } from 'react-native';

export const SIGNUP = 'SIGNUP';
export const LOGIN = 'LOGIN';
export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';
let timer;

export const authenticate = (userId, token, expiryTime) => {
    return dispatch => {
        dispatch(setLogoutTimer(expiryTime));
        dispatch({ type: AUTHENTICATE, token: token, userId: userId });
    }
}

export const login = (email, password) => {
    return async dispatch => {
        const date = new Date();
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB6hGP882ZYYa6oCbY5FPp_lOhlk_6oWHA`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })
        });
        if(!response.ok){
          const errorResData = await response.json();
          const errorId = errorResData.error.message;
          let message = 'Something went wrong!';
          if(errorId === "EMAIL_NOT_FOUND"){
                message = 'This email couldn\'t found!';
          }
          else if(errorId === "INVALID_PASSWORD"){
                message = 'This password is invalid';
            }
          throw new Error(message);
        }
        const resData = await response.json();
        dispatch(authenticate(resData.localId, resData.idToken, +resData.expiresIn * 1000));
        const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
        saveDataToStorage(resData.idToken, resData.localId, expirationDate);
      }
}

export const signUp = (email, password) => {

  return async dispatch => {
    const date = new Date();
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyB6hGP882ZYYa6oCbY5FPp_lOhlk_6oWHA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
        })
    });
    if(!response.ok){
        const errorResData = await response.json();
          console.log('errorResData', errorResData);
          const errorId = errorResData.error.message;
          let message = 'Something went wrong!';
          if(errorId === "EMAIL_EXISTS"){
                message = 'The email address is already in use';
          }
          else if(errorId === "OPERATION_NOT_ALLOWED"){
                message = 'Password sign-in is disabled for this project';
            }
          throw new Error(message);
    }
    const resData = await response.json();
    dispatch(authenticate(resData.localId, resData.idToken, +resData.expiresIn * 1000));
    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  }

};

export const logout = () => {
    clearLogoutTimer();
    AsyncStorage.removeItem('userData');
    return { type: LOGOUT }
}

const clearLogoutTimer = () => {
  if(timer){
    clearTimeout(timer);
  }
}

const setLogoutTimer = expirationTime => {
        return dispatch => {
            setTimeout(()=> dispatch(logout()) , expirationTime);
        }
}

const saveDataToStorage = (token, userId, expirationDate) => {
        AsyncStorage.setItem('userData', JSON.stringify({
            token: token,
            userId: userId,
            expiryDate: expirationDate.toISOString()
        }));
}