import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";


const firebaseConfig = {
    apiKey: "AIzaSyAc6a1dVSXbrvboKxeGUbBfdQQSp2yw0P8",
    authDomain: "apesysinstitute.firebaseapp.com",
    projectId: "apesysinstitute",
    storageBucket: "apesysinstitute.appspot.com",
    messagingSenderId: "539353549448",
    appId: "1:539353549448:web:eae35d443fe75c64412d3d",
    measurementId: "G-LR31XDCFMK"
  };

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase }



