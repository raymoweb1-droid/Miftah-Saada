/* 
   Supabase Configuration - PRODUCTION READY
*/

const SUPABASE_URL = 'https://phqqxfkvixawzpyumasv.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocXF4Zmt2aXhhd3pweXVtYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Mjc1MjksImV4cCI6MjA5MjEwMzUyOX0.GTtvw3QTMChEPlM7T6izLpKQgI_63HxbkDf9oWLwT-0'; 

window.supabaseClient = null;

try {
    const lib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
    
    if (lib && SUPABASE_URL && SUPABASE_KEY) {
        // Create the core client
        const client = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = client;
        console.log("✅ Supabase Real Auth Mode Active");
    }
} catch (err) {
    console.error("❌ Crash during init:", err);
}
