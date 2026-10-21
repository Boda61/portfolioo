// Supabase Configuration
const SUPABASE_URL = "https://qwbjeqkmljowzxjxwnrr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0Q9TA1zsan-AynQSX59Q3w_pzbxNfoj";

// Initialize Supabase Client
var supabaseClient = null;

function initSupabase() {
    if (window.supabase && !window.supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient;
    }
    return window.supabaseClient || supabaseClient;
}

initSupabase();

// Retry fallback in case CDN script loads asynchronously
if (!window.supabaseClient) {
    window.addEventListener("load", initSupabase);
}
