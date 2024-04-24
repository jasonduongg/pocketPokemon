import { initializeApp } from "firebase/app";
import {getDatabase} from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCXmAK7MBlRZ_6xkw-rApT9ikvfwnLNA1A",
  authDomain: "pokemon-real-186f0.firebaseapp.com",
  projectId: "pokemon-real-186f0",
  storageBucket: "pokemon-real-186f0.appspot.com",
  messagingSenderId: "554141505618",
  appId: "1:554141505618:web:6205da4bd9a0c2baba278b",
  databaseURL: "https://pokemon-real-186f0-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);