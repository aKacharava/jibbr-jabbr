import React, { useState, useRef } from "react";

import firebase from "firebase"; /// For the base SDK
import "firebase/firestore"; /// For database
import "firebase/auth"; /// For user authentication

/// For making easy usage of Firebase in React
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyA09zUO2xY25_bOyvccnWnou1ZtL-P60-o",
  authDomain: "jibbr-jabbr-67ce5.firebaseapp.com",
  projectId: "jibbr-jabbr-67ce5",
  storageBucket: "jibbr-jabbr-67ce5.appspot.com",
  messagingSenderId: "378562214386",
  appId: "1:378562214386:web:f877b37f6e22ca5872936b",
  measurementId: "G-VFPWPLEJJP",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut}> Sign Out </button>
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection("messages"); /// Create reference of message in firebase
  const query = messagesRef.orderBy("createdAt").limit(25); /// Create query to store and order messages reference

  const [messages] = useCollectionData(query, { idField: "id" }); /// Make query and listen to updates of data in real time with hook
  const [formValue, setFormValue] = useState("");

  const dummy = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" placeholder="Send something"> Send </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageUser = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageUser}`}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  );
}

export default function App() {
  /// object that has user information
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>{user ? <SignOut /> : ""}</header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}
