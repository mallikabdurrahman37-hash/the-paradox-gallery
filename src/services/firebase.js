import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
  increment,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDNDQjRX8Y7j4zZ0mV-m__HyJWrQgTBxYA",
  authDomain: "the-paradox-gallery.firebaseapp.com",
  projectId: "the-paradox-gallery",
  storageBucket: "the-paradox-gallery.firebasestorage.app",
  messagingSenderId: "659400708496",
  appId: "1:659400708496:web:f9a8c5c8ba33f15ce8e315",
  measurementId: "G-GMGTY7W8TW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth helpers
export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// User profile helpers
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    username: '',
    email: data.email,
    createdAt: serverTimestamp(),
    ...data,
  });
};

export const setUsername = async (uid, username) => {
  await updateDoc(doc(db, 'users', uid), { username });
};

// Artwork helpers
export const getArtworks = async () => {
  const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getArtworksByUser = async (uid) => {
  const q = query(collection(db, 'artworks'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addArtwork = async (data) => {
  return addDoc(collection(db, 'artworks'), {
    ...data,
    likesCount: 0,
    likedBy: [],
    views: 0,
    createdAt: serverTimestamp(),
  });
};

export const toggleLike = async (artworkId, uid) => {
  const ref = doc(db, 'artworks', artworkId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Artwork not found');
    const data = snap.data();
    const likedBy = data.likedBy || [];
    const isLiked = likedBy.includes(uid);
    if (isLiked) {
      tx.update(ref, {
        likedBy: likedBy.filter((id) => id !== uid),
        likesCount: Math.max(0, (data.likesCount || 1) - 1),
      });
      return false;
    } else {
      tx.update(ref, {
        likedBy: [...likedBy, uid],
        likesCount: (data.likesCount || 0) + 1,
      });
      return true;
    }
  });
};

export const incrementView = async (artworkId) => {
  const ref = doc(db, 'artworks', artworkId);
  await updateDoc(ref, { views: increment(1) });
};
