/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// These values are provided by the environment in firebase-applet-config.json
// In a real app, you'd use environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyCrtTrjBQJuWIDSUV731lmo4o7LjWZ0Y7U",
  authDomain: "cohesive-inkwell-r8gvj.firebaseapp.com",
  projectId: "cohesive-inkwell-r8gvj",
  storageBucket: "cohesive-inkwell-r8gvj.firebasestorage.app",
  messagingSenderId: "204691124515",
  appId: "1:204691124515:web:409d38cae166b2a5e5dc96"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-brightnbliss-99bf1607-3686-4a3e-8ce2-9b386da73782");
export const auth = getAuth(app);
