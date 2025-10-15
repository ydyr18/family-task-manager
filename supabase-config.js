// Supabase Configuration
const SUPABASE_URL = 'https://wwvlstvyqoccrgfylgfx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dmxzdHZ5cW9jY3JnZnlsZ2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDg0MzAsImV4cCI6MjA3NjA4NDQzMH0.IAqFEoZUifs4dg28CwllW4C0RGWUw9b1knBWG2hr3Wk';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔥 Supabase initialized successfully');
