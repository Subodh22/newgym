# PowerShell script to create .env.local file

$envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: Other API Keys (if needed)
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# REPLICATE_API_TOKEN=your_replicate_api_token_here
# DEEPGRAM_API_KEY=your_deepgram_api_key_here
"@

$envPath = Join-Path $PSScriptRoot ".env.local"

if (-not (Test-Path $envPath)) {
    $envContent | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
    Write-Host "📝 Please update the environment variables with your actual values" -ForegroundColor Yellow
    Write-Host "🔗 Get your Supabase keys from: https://app.supabase.com/project/_/settings/api" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️ .env.local already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Magenta
Write-Host "1. Update .env.local with your Supabase credentials"
Write-Host "2. Run: npm run dev"
Write-Host "3. Your app should now work without the SUPABASE_SERVICE_ROLE_KEY error"