// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjwyspujcmbqlhwpazks.supabase.co' // ← remplace par le tien
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqd3lzcHVqY21icWxod3BhemtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNzgyNTksImV4cCI6MjA2MTY1NDI1OX0.JGDtANllmQSKjmriYmqWBgjXZFQ_ZdPT6X16ERNbREg' // ← remplace par ta clé anon

export const supabase = createClient(supabaseUrl, supabaseKey)
