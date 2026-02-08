# Script de configuration Email pour Windows
# Utilisation: PowerShell -ExecutionPolicy Bypass -File setup-email.ps1

Write-Host "🚀 Configuration Email - Réinitialisation Mot de Passe" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que supabase CLI est installé
try {
    $supabaseVersion = supabase --version 2>$null
    Write-Host "✅ Supabase CLI détecté: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Installation:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "📧 Choix du service d'email:" -ForegroundColor Cyan
Write-Host "1) Resend (RECOMMANDÉ - Gratuit)" -ForegroundColor White
Write-Host "2) SendGrid (Alternative)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Votre choix (1 ou 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "📧 Configuration Resend" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Allez sur https://resend.com" -ForegroundColor White
    Write-Host "2. Créez un compte" -ForegroundColor White
    Write-Host "3. Allez à 'API Keys'" -ForegroundColor White
    Write-Host "4. Créez une nouvelle clé" -ForegroundColor White
    Write-Host "5. Copiez la clé (commence par 're_')" -ForegroundColor White
    Write-Host ""
    $apiKey = Read-Host "Paste your Resend API key"
    
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host "❌ Clé vide" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "⏳ Ajout de la clé à Supabase..." -ForegroundColor Yellow
    supabase secrets set RESEND_API_KEY="$apiKey"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Clé Resend ajoutée avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'ajout de la clé" -ForegroundColor Red
        exit 1
    }

} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "📧 Configuration SendGrid" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Allez sur https://sendgrid.com" -ForegroundColor White
    Write-Host "2. Créez un compte" -ForegroundColor White
    Write-Host "3. Allez à Settings > API Keys" -ForegroundColor White
    Write-Host "4. Créez une nouvelle clé avec permission 'Mail Send'" -ForegroundColor White
    Write-Host "5. Copiez la clé (commence par 'SG.')" -ForegroundColor White
    Write-Host ""
    $apiKey = Read-Host "Paste your SendGrid API key"
    
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host "❌ Clé vide" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "⏳ Ajout de la clé à Supabase..." -ForegroundColor Yellow
    supabase secrets set SENDGRID_API_KEY="$apiKey"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Clé SendGrid ajoutée avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'ajout de la clé" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Choix invalide" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Déploiement de la fonction Edge..." -ForegroundColor Yellow
Write-Host ""
supabase functions deploy send-reset-code

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Fonction déployée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Configuration complète!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Attendez 30-60 secondes pour la propagation" -ForegroundColor White
    Write-Host "2. Allez à http://localhost:5173/forgot-password" -ForegroundColor White
    Write-Host "3. Entrez votre email" -ForegroundColor White
    Write-Host "4. Vérifiez votre inbox" -ForegroundColor White
    Write-Host "5. Vous devriez recevoir un email avec le code ✉️" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Vérifier le statut:" -ForegroundColor Cyan
    Write-Host "   supabase functions list" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    exit 1
}
