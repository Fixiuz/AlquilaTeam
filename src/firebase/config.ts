import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDNklxn4IakD52-J2re78p8yrvsqr8dgVw",
  authDomain: "studio-4799479286-2493d.firebaseapp.com",
  projectId: "studio-4799479286-2493d",
  storageBucket: "studio-4799479286-2493d.firebasestorage.app",
  messagingSenderId: "582353989118",
  appId: "1:582353989118:web:815643a9fbf1dedf7e64af"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
