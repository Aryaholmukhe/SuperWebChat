import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// makes the database with google firebase
firebase.initializeApp({
  // write your config
  apiKey: "AIzaSyD8hxw9kf7jduy-cQaPH_ALH9J-On9Qm8U",
  authDomain: "chatapp-c8f0d.firebaseapp.com",
  projectId: "chatapp-c8f0d",
  storageBucket: "chatapp-c8f0d.appspot.com",
  messagingSenderId: "166961691231",
  appId: "1:166961691231:web:58b7adc6412a4c870c79ea",
  measurementId: "G-80C5B3F3NZ"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  // makes user an object
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>

      </header>

      <section>
        {/* (User is an object or null) */}
        {/* if user exists go to chatroom or else go to sign in with google */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  // makes arrow function to sign in with google
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // opens a popup which allows users to sign in with google 
    // (don't need to create your own database)
    auth.signInWithPopup(provider);
  }
  return (
    // Goes to sign in
    <>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  return (
    // checks if user exists
    auth.currentUser && (
      // trigger sign out from function
      <button onClick={() => auth.signOut()}>Sign Out</button>
    )
  )
}

function ChatRoom() {

  const dummy = useRef();
  // stores the message and timestamp
  const messagesRef = firestore.collection('messages');
  // contains all the messages by the order of timestamp
  // limit to the last 25 messages
  const query = messagesRef.orderBy('createdAt').limit(25);
  // listen to it in realtime with the useCollectionData hook
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  // sends msg
  const sendMessage = async (e) => {
    e.preventDefault();
    // fetches user id and pfp
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    // smoothly comes to msg
    dummy.current.scrollIntoView({behavior:'smooth'})
  }
  return (
    <div>
      <main>
        {/* renders all the messages */}
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
{/* so that user's msgs are visible */}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        {/* saves the msg */}
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='submit'>Send</button>
      </form>
    </div>
  )
}

function ChatMessage(props) {
  // gets the text from the db
  const { text, uid, photoURL } = props.message;
  // givies either the 'sent' or 'received class accordingly
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<div className={`message ${messageClass}`}>
    <img src={photoURL} />
    <p>{text}</p>
  </div>
  )
}

export default App;
