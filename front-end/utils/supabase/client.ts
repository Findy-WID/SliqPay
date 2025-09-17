import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jwqjrbahxeelfkrzgtiq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWpyYmFoeGVlbGZrcnpndGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjcyNDUsImV4cCI6MjA3MzYwMzI0NX0.SOjVl_iWETcuJubZADaj_1TRghX8X0f7VoaL3zNNAh0'
const supabase = createClient(supabaseUrl, supabaseAnonKey)