import { createClient } from '@supabase/supabase-js'

// 从你刚才配置的 .env.local 中读取钥匙
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建并导出客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)