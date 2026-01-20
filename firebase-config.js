const firebaseConfig = {
    apiKey: "AIzaSyCJlqL4VA17aCr9wfKEP3fxAK5IGW_GoGE",
    authDomain: "accounting-checkin.firebaseapp.com",
    projectId: "accounting-checkin",
    storageBucket: "accounting-checkin.firebasestorage.app",
    messagingSenderId: "741311754434",
    appId: "1:741311754434:web:7396164852387302018b5b"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();