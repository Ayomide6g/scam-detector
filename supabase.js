import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://sijqarxgtwwqniaghakw.supabase.co'
const supabaseAnonKey = 'sb_publishable_pINAQj98YWZ7mruyag5oiA_sgerOZsI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
      storage: AsyncStorage,
          autoRefreshToken: true,
              persistSession: true,
                  detectSessionInUrl: false,
                    },
                    })