import { createClient } from "@supabase/supabase-js";

// These are public client-side settings. Never put a service_role key in the browser.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://lskiksapwqonpuskcbxy.supabase.co";
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "sb_publishable_Xoac2UxvkZcLDP91OWoy2A_Mt3kG8Pg";

export const supabase = createClient(url, anonKey);
