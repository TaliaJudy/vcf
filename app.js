// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCyQTC9BMD90v8EOS5ZJOOzLArqifp85Qk",
  authDomain: "cytra-a9b1d.firebaseapp.com",
  projectId: "cytra-a9b1d",
  storageBucket: "cytra-a9b1d.firebasestorage.app",
  messagingSenderId: "60383087529",
  appId: "1:60383087529:web:4c4c792eba06a10f4412b8",
  measurementId: "G-LGJ250744Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const contactsRef = collection(db, "contacts");

const form = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const contactList = document.getElementById("contactList");
const progress = document.getElementById("progress");
const downloadVCF = document.getElementById("downloadVCF");

// Add contact to Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!phone.startsWith("+")) {
    alert("Phone number must start with + and country code.");
    return;
  }

  try {
    const snapshot = await getDocs(contactsRef);
    const exists = snapshot.docs.some(
      doc =>
        doc.data().phone === phone ||
        doc.data().name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      alert("This contact already exists.");
      return;
    }

    await addDoc(contactsRef, { name, phone });
    console.log("✅ Contact added:", name, phone);

    nameInput.value = "";
    phoneInput.value = "";
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    alert("Error saving contact. Check console.");
  }
});

// Live sync & download
onSnapshot(contactsRef, (snapshot) => {
  contactList.innerHTML = "";
  let vcfContent = "";
  let count = 0;

  snapshot.forEach((doc) => {
    const { name, phone } = doc.data();
    count++;

    const li = document.createElement("li");
    li.textContent = `${name} — ${phone}`;
    contactList.appendChild(li);

    vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEND:VCARD\n`;
  });

  progress.textContent = `📱 Total Contacts: ${count}`;

  downloadVCF.onclick = () => {
    const blob = new Blob([vcfContent], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cytra_contacts.vcf";
    link.click();
  };
});
