import React, { useState } from "react";
import supabase from "../supabaseClient";
import Swal from "sweetalert2";
import { LogIn, UserPlus } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Swal.fire("Login Failed", error.message, "error");
    }
  }

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Swal.fire("Signup Failed", error.message, "error");
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        name: "",
        age: "",
        image: ""
      });
    }

    Swal.fire("Signup Successful", "Please check your email to confirm.", "success");
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indigo-700">Welcome</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in or create an account</p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={signIn}
            className="w-1/2 mr-2 flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 px-4 rounded-lg transition-all duration-200 font-semibold"
          >
            <LogIn className="w-5 h-5" /> Login
          </button>
          <button
            onClick={signUp}
            className="w-1/2 ml-2 flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg transition-all duration-200 font-semibold"
          >
            <UserPlus className="w-5 h-5" /> Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
