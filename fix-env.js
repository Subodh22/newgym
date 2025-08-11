const fs = require('fs');
const path = require('path');

// Create .env.local file with template
const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: Other API Keys (if needed)
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# REPLICATE_API_TOKEN=your_replicate_api_token_here
# DEEPGRAM_API_KEY=your_deepgram_api_key_here
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('📝 Please update the environment variables with your actual values');
  console.log('🔗 Get your Supabase keys from: https://app.supabase.com/project/_/settings/api');
} else {
  console.log('ℹ️ .env.local already exists');
}

console.log('\n🚀 Next steps:');
console.log('1. Update .env.local with your Supabase credentials');
console.log('2. Run: npm run dev');
console.log('3. Your app should now work without the SUPABASE_SERVICE_ROLE_KEY error');