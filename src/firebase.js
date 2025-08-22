import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDNTzK1cO4efH5s93fAYqGbE6LdvfHtp20",
  authDomain: "smite-draft-d595b.firebaseapp.com",
  projectId: "smite-draft-d595b",
  storageBucket: "smite-draft-d595b.firebasestorage.app",
  messagingSenderId: "668428709603",
  appId: "1:668428709603:web:5747a8cdb7324c4d9bdfd6"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
