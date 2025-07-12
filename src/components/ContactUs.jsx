import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "./Navbar";

export default function ContactUs() {
  const form = useRef();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .sendForm(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        form.current,
        "YOUR_PUBLIC_KEY"
      )
      .then(
        () => {
          setLoading(false);
          setSent(true);
          form.current.reset();
          setTimeout(() => setSent(false), 3000);
        },
        (error) => {
          setLoading(false);
          alert("Failed to send. Try again.");
          console.error(error);
        }
      );
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
     <Navbar/>
     <div className="flex-grow flex items-center justify-center text-gray-400 text-xl font-semibold" >
 
      <form
        ref={form}
        onSubmit={sendEmail}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-indigo-600 text-center mb-6">
          Contact Us
        </h2>

        <input
          type="text"
          name="user_name"
          placeholder="Your Name"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <input
          type="email"
          name="user_email"
          placeholder="Your Email"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <textarea
          name="message"
          placeholder="Your Message"
          required
          rows="5"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 font-semibold rounded-lg transition duration-300 ease-in-out transform ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 hover:scale-105 text-white"
          }`}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

        {sent && (
          <p className="text-green-500 text-center mt-4 animate-bounce">
            Message Sent Successfully ✅
          </p>
        )}
      </form>
      </div>
    </div>
  );
}
