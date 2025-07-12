import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://orxruhnugjgkfqfciixy.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeHJ1aG51Z2pna2ZxZmNpaXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjU2NDUsImV4cCI6MjA2NzcwMTY0NX0.GNGyAhnEgSoV7iseSLprt6ul2bBgPxQCRr0HasFltls'; // move this to .env later
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
