// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCyQTC9BMD90v8EOS5ZJOOzLArqifp85Qk",
  authDomain: "cytra-a9b1d.firebaseapp.com",
  projectId: "cytra-a9b1d",
  storageBucket: "cytra-a9b1d.appspot.com",
  messagingSenderId: "60383087529",
  appId: "1:60383087529:web:4c4c792eba06a10f4412b8",
  measurementId: "G-LGJ250744Y"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const contactsRef = db.collection("contacts");

// Random favicon
const domains = [
  "google.com", "youtube.com", "github.com", "twitter.com",
  "netflix.com", "spotify.com", "amazon.com", "wikipedia.org"
];
function getRandomFavicon() {
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

// Add contact
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();

  if (!name || !phone) return alert("Name and phone are required!");
  if (!phone.startsWith("+")) phone = "+" + phone;

  const exists = await contactsRef.where("phone", "==", phone).get();
  if (!exists.empty) return alert("This number already exists!");

  await contactsRef.add({ name, phone });
  document.getElementById("contactForm").reset();
  fetchContacts();
});

// Fetch & render contacts
async function fetchContacts() {
  const container = document.getElementById("contactsContainer");
  container.innerHTML = "";
  const snapshot = await contactsRef.get();

  let contacts = [];
  snapshot.forEach(doc => {
    contacts.push(doc.data());
  });

  contacts.forEach(contact => {
    const avatar = getRandomFavicon();

    const card = document.createElement("div");
    card.className = "flex items-center bg-white p-4 rounded shadow-md hover:bg-gray-100 transition";

    card.innerHTML = `
      <img src="${avatar}" class="w-10 h-10 rounded-full mr-4 border" alt="avatar" />
      <div class="flex-1">
        <h3 class="font-semibold">${contact.name}</h3>
        <p class="text-gray-600">${contact.phone}</p>
      </div>
      <a href="https://wa.me/${contact.phone.replace(/\+/g, '')}" target="_blank"
         class="text-blue-500 hover:underline">WhatsApp</a>
    `;

    container.appendChild(card);
  });
}

// Download VCF
document.getElementById("downloadBtn").addEventListener("click", async () => {
  const snapshot = await contactsRef.get();
  let vcf = "";

  snapshot.forEach(doc => {
    const contact = doc.data();
    vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.name}\nTEL:${contact.phone}\nEND:VCARD\n`;
  });

  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts.vcf";
  a.click();
  URL.revokeObjectURL(url);
});

// On load
fetchContacts();
