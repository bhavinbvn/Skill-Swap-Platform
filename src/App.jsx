  // Required dependencies:
  // npm install @supabase/supabase-js react-router-dom

  // import React, { useState, useEffect } from "react";
  // import {
  //   BrowserRouter as Router,
  //   Routes,
  //   Route,
  //   Navigate,
  // } from "react-router-dom";
  // import supabase from "./supabaseClient";

  // import { createClient } from "@supabase/supabase-js";


  // const supabaseUrl = 'https://orxruhnugjgkfqfciixy.supabase.co'
  // // const supabaseKey = process.env.SUPABASE_KEY
  // const supabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeHJ1aG51Z2pna2ZxZmNpaXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjU2NDUsImV4cCI6MjA2NzcwMTY0NX0.GNGyAhnEgSoV7iseSLprt6ul2bBgPxQCRr0HasFltls')

//   const AuthContext = React.createContext();

//   function App() {
//     const [session, setSession] = useState(null);

//     useEffect(() => {
//       supabase.auth.getSession().then(({ data: { session } }) => {
//         setSession(session);
//       });
//       const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//         setSession(session);
//       });
//       return () => listener.subscription.unsubscribe();
//     }, []);

//     return (
//       <AuthContext.Provider value={{ session }}>
//         <Router>
//           <Routes>
//             <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
//             <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/" />} />
//           </Routes>
//         </Router>
//       </AuthContext.Provider>
//     );
//   }

//   function Auth() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     async function signIn() {
//       const { error } = await supabase.auth.signInWithPassword({ email, password });
//       if (error) alert(error.message);
//     }

//     async function signUp() {
//   const { data, error } = await supabase.auth.signUp({ email, password });
//   if (error) return alert(error.message);

//   // After successful sign-up, insert blank profile
//   if (data.user) {
//     await supabase.from("profiles").insert({
//       id: data.user.id,
//       name: "",
//       age: "",
//       image: ""
//     });
//   }

//   alert("Signup successful! Please check your email for confirmation.");
// }


//     return (
//       <div className="p-6 max-w-sm mx-auto">
//         <h1 className="text-xl mb-4">Login / Sign Up</h1>
//         <input className="border p-2 mb-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
//         <input className="border p-2 mb-2 w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//         <button onClick={signIn} className="bg-blue-500 text-white p-2 mr-2">Login</button>
//         <button onClick={signUp} className="bg-green-500 text-white p-2">Sign Up</button>
//       </div>
//     );
//   }

//   function Dashboard() {
//     const [profile, setProfile] = useState({ name: "", age: "", image: "" });
//     const [editing, setEditing] = useState(false);
//     const [file, setFile] = useState(null);

//     useEffect(() => {
//       getProfile();
//     }, []);

//     async function getProfile() {
//       const { data: { user } } = await supabase.auth.getUser();
//       const { data, error } = await supabase.from("profiles").select("name, age, image").eq("id", user.id).single();
//       if (error) console.error(error);
//       else setProfile(data);
//     }

// async function updateProfile() {
//   const { data: { user } } = await supabase.auth.getUser();
//   let imageUrl = profile.image;

//   if (file) {
//     const { data, error: uploadError } = await supabase.storage
//       .from("avatars")
//       .upload(`${user.id}/${file.name}`, file, { upsert: true });

//     if (uploadError) {
//       alert("Image upload failed: " + uploadError.message);
//       return;
//     }

//     const { data: urlData } = supabase.storage
//       .from("avatars")
//       .getPublicUrl(`${user.id}/${file.name}`);
//     imageUrl = urlData.publicUrl;
//   }

//   const { error } = await supabase.from("profiles").upsert({
//     id: user.id,
//     name: profile.name,
//     age: profile.age,
//     image: imageUrl,
//   });

//   if (error) {
//     alert("Profile update failed: " + error.message);
//   } else {
//     setEditing(false);
//     alert("Profile updated!");
//   }
// }


//     return (
//       <div className="p-6 max-w-md mx-auto">
//         <h2 className="text-2xl mb-4">User Dashboard</h2>
//         {editing ? (
//           <>
//             <input className="border p-2 mb-2 w-full" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
//             <input className="border p-2 mb-2 w-full" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} placeholder="Age" />
//             <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
//             <button className="bg-green-500 text-white p-2 mr-2" onClick={updateProfile}>Save</button>
//           </>
//         ) : (
//           <>
//          {profile.image && (
//   <img src={profile.image} alt="Profile" className="w-32 h-32 object-cover mb-2" />
// )}

//             <p><strong>Name:</strong> {profile.name}</p>
//             <p><strong>Age:</strong> {profile.age}</p>
//             <button className="bg-blue-500 text-white p-2 mt-4" onClick={() => setEditing(true)}>Edit Profile</button>
//           </>
//         )}
//       </div>
//     );
//   }

//   export default App;
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import SearchUsers from "./components/SearchUsers";
import SwapRequests from "./components/SwapRequests";
import Contact from "./components/ContactUs";

function AppRoutes() {
  const { session } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/search" element={session ? <SearchUsers /> : <Navigate to="/" />} />
      <Route path="/requests" element={session ? <SwapRequests /> : <Navigate to="/" />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
