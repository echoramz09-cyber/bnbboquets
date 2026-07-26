
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import * as fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyCrtTrjBQJuWIDSUV731lmo4o7LjWZ0Y7U",
  authDomain: "cohesive-inkwell-r8gvj.firebaseapp.com",
  projectId: "cohesive-inkwell-r8gvj",
  storageBucket: "cohesive-inkwell-r8gvj.firebasestorage.app",
  messagingSenderId: "204691124515",
  appId: "1:204691124515:web:409d38cae166b2a5e5dc96"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-brightnbliss-99bf1607-3686-4a3e-8ce2-9b386da73782");

async function seed() {
  const blueprint = JSON.parse(fs.readFileSync('./firebase-blueprint.json', 'utf8'));
  const collections = blueprint.collections;

  for (const [colName, docs] of Object.entries(collections)) {
    console.log(`Seeding collection: ${colName}`);
    for (const [docId, data] of Object.entries(docs as any)) {
      await setDoc(doc(db, colName, docId), data as any);
      console.log(`  - Seeded doc: ${docId}`);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
