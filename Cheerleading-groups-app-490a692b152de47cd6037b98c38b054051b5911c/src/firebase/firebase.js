// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBsYVGTtEcpL235Du7rXDbgg1ZzgVKR8q8",
  authDomain: "cheerapp-c0e5e.firebaseapp.com",
  projectId: "cheerapp-c0e5e",
  storageBucket: "cheerapp-c0e5e.appspot.com",
  messagingSenderId: "756975703765",
  appId: "1:756975703765:web:3af02ba1e4a7c402d0345c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
