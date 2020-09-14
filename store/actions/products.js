import Product from "../../models/product";
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';

export const fetchProducts = () => {
  return async (dispatch, getState)  => {
   try {
    const userId = getState().auth.userId;
    const response = await fetch('https://absoluteindialocations-147909.firebaseio.com/products.json');
    if(!response.ok){
        throw new Error('Something went wrong');
    }
    const responseData = await response.json();
    const loadedProducts = [];
    for(const key in responseData){
      loadedProducts.push(
        new Product(
          key, 
          responseData[key].ownerId, 
          responseData[key].ownerPushToken, 
          responseData[key].title, 
          responseData[key].imageUrl, 
          responseData[key].description, 
          responseData[key].price
          )
        );
    }
    dispatch({ type: SET_PRODUCTS, products: loadedProducts, userProducts: loadedProducts.filter(prod => prod.ownerId === userId) });
 }
 catch(err) {
    throw new Error('Got error');
 }
}
}

export const deleteProduct = productId => {
  return async (dispatch, getState) => {
    try {
    const token = getState().auth.token;
    const response = await fetch(`https://absoluteindialocations-147909.firebaseio.com/products/${productId}.json?auth=${token}`, {
      method: 'DELETE'
    });
    if(!response.ok){
      throw new Error('Something went wrong!');
    }
    const responseData = await response.json();
    dispatch({ type: DELETE_PRODUCT, pid: productId });
  }
  catch(err){
    throw new Error('Something went wrong');
  }

  }
};

export const createProduct = (title, description, imageUrl, price) => {
  return async (dispatch, getState) => {

    let pushToken;
    let statusObj = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if(statusObj.status !== 'granted'){
      statusObj = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    }
    if(statusObj.status !== 'granted'){
      pushToken = null;
    }
    else{
     pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    }

    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(`https://absoluteindialocations-147909.firebaseio.com/products.json?auth=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
        ownerPushToken: pushToken
      })
    });
    if(!response.ok){
      throw new Error('Something went wrong!');
    }
    const responseData = await response.json();

    return dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: responseData.name,
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
        pushToken: pushToken
      }
  });
  };
};

export const updateProduct = (id, title, description, imageUrl) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    try {
    const response = await fetch(`https://absoluteindialocations-147909.firebaseio.com/products/${id}.json?auth=${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        imageUrl
      })
    });
    if(!response.ok){
      throw new Error('Something went wrong!');
    }
    await response.json();
  }
  catch(err){
    
  }
  }
};
