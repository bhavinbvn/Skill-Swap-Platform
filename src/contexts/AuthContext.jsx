import React, { createContext, useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};
