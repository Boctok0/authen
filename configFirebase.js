// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { addDoc, collection, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyASJVArQoWaLifCBx_hr4n2TTP8xE2cfZ8",
    authDomain: "webb-b97cf.firebaseapp.com",
    projectId: "webb-b97cf",
    storageBucket: "webb-b97cf.firebasestorage.app",
    messagingSenderId: "712924028879",
    appId: "1:712924028879:web:93a37df99d8b1ec1c87cba",
    measurementId: "G-TJTW6NGYQM"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const providerGoogle = new GoogleAuthProvider();

export async function LoginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, providerGoogle);
        const users = await getUsers();
        const user = users.find(user => user.email === result.user.email);
        if (user) {
            return user;
        } else {
            const newUser = {
                fullName: result.user.displayName,
                email: result.user.email,
                age: null,
                createdAt: new Date()
            }
            await createUser(newUser);
            return newUser;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function createUser(user) {
    try {
        const userRef = await addDoc(collection(db, "users"), user);
        return userRef;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function handleLogin(email, password) {
    try {
        const users = await getUsers();
        return users.find(user => (user.email === email && user.password === password));
    } catch (error) {
        console.log(error);
        throw error;
    }
}