// -------------------------------
// Firebase Config
// -------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCnO-eyJo4JSXrtORrbjKRwSj82h-nOpzk",
  authDomain: "messaging-system-4c3ac.firebaseapp.com",
  databaseURL: "https://messaging-system-4c3ac-default-rtdb.firebaseio.com",
  projectId: "messaging-system-4c3ac",
  storageBucket: "messaging-system-4c3ac.firebasestorage.app",
  messagingSenderId: "391312179095",
  appId: "1:391312179095:web:68e7de6720cb41df44ced2",
  measurementId: "G-DKY36G4X9F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;
let currentRoom = "general";

// Google Login
document.getElementById('login-btn').onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.querySelector('header').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';
    loadMessages(currentRoom);
    setUserOnlineStatus(true);
  } else {
    currentUser = null;
    document.querySelector('header').style.display = 'block';
    document.getElementById('chat-container').style.display = 'none';
  }
});

// Send message
document.getElementById('send').onclick = () => {
  const text = document.getElementById('input').value.trim();
  if (!text) return;
  const timestamp = Date.now();
  db.ref(`rooms/${currentRoom}/messages`).push({
    text: text,
    uid: currentUser.uid,
    name: currentUser.displayName,
    photo: currentUser.photoURL || "",
    timestamp: timestamp
  });
  document.getElementById('input').value = "";
};

// Load messages
function loadMessages(room) {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';
  const messagesRef = db.ref(`rooms/${room}/messages`);
  messagesRef.off();
  messagesRef.on('child_added', snapshot => {
    const msg = snapshot.val();
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msg.uid === currentUser.uid ? 'my-message' : 'other-message');

    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    const time = new Date(msg.timestamp).toLocaleTimeString();
    meta.textContent = `${msg.name} • ${time}`;

    const textDiv = document.createElement('div');
    textDiv.textContent = msg.text;

    div.appendChild(meta);
    div.appendChild(textDiv);
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Switch rooms
document.querySelectorAll('#rooms div').forEach(roomDiv => {
  roomDiv.onclick = () => {
    document.querySelectorAll('#rooms div').forEach(d => d.classList.remove('active'));
    roomDiv.classList.add('active');
    currentRoom = roomDiv.dataset.room;
    loadMessages(currentRoom);
  };
});

// Online status
function setUserOnlineStatus(isOnline) {
  if (!currentUser) return;
  const userStatusRef = db.ref(`status/${currentUser.uid}`);
  const status = isOnline ? 'online' : 'offline';
  userStatusRef.set({
    name: currentUser.displayName,
    photo: currentUser.photoURL || '',
    status: status,
    lastChanged: Date.now()
  });
  window.addEventListener('beforeunload', () => {
    userStatusRef.set({
      name: currentUser.displayName,
      photo: currentUser.photoURL || '',
      status: 'offline',
      lastChanged: Date.now()
    });
  });
}
