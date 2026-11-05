import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBxi3mAYFKmVdD67oSGuGSMkYRM5fKo5oQ',
  authDomain: 'dz-edupro.firebaseapp.com',
  projectId: 'dz-edupro',
  storageBucket: 'dz-edupro.firebasestorage.app',
  messagingSenderId: '183285874279',
  appId: '1:183285874279:web:74b281b4a315a71139dec2',
  measurementId: 'G-KY0C1W2C6S',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
