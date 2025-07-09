// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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

// Hàm mã hóa password đơn giản (trong thực tế nên dùng bcrypt hoặc argon2)
function hashPassword(password) {
    return btoa(password); // Đây chỉ là ví dụ, không nên dùng trong production
}

// Hàm kiểm tra password
function verifyPassword(password, hashedPassword) {
    return btoa(password) === hashedPassword;
}

export async function LoginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, providerGoogle);
        const users = await getUsers();
        const user = users.find(user => user.email === result.user.email);
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        } else {
            const newUser = {
                fullName: result.user.displayName,
                email: result.user.email,
                age: null,
                createdAt: new Date(),
                role: 'user'
            }
            await createUser(newUser);
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            return newUser;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function createUser(user) {
    try {
        // Kiểm tra email đã tồn tại
        const users = await getUsers();
        const existingUser = users.find(u => u.email === user.email);
        if (existingUser) {
            throw new Error('Email đã tồn tại');
        }

        // Mã hóa password nếu có
        if (user.password) {
            user.password = hashPassword(user.password);
        }

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
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function handleLogin(email, password) {
    try {
        const users = await getUsers();
        const user = users.find(user => user.email === email);
        
        if (user && verifyPassword(password, user.password)) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        }
        return null;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function updateUser(userId, userData) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, userData);
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function deleteUser(userId) {
    try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Middleware để kiểm tra đăng nhập
export function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Middleware để kiểm tra role
export function checkRole(allowedRoles) {
    const currentUser = checkAuth();
    if (!currentUser) return false;
    
    if (!allowedRoles.includes(currentUser.role)) {
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = 'list-users.html';
        return false;
    }
    return true;
}