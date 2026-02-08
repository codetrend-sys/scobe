#!/bin/bash
# Script de configuration complète pour l'email de réinitialisation de mot de passe
# Utilisation: bash setup-email.sh

echo "🚀 Configuration Email - Réinitialisation Mot de Passe"
echo "======================================================"
echo ""

# Vérifier que supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "📥 Installation:"
    echo "   npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI détecté"
echo ""

# Choix du service
echo "Choisissez un service d'email:"
echo "1) Resend (RECOMMANDÉ - Gratuit)"
echo "2) SendGrid (Alternative)"
echo ""
read -p "Votre choix (1 ou 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📧 Configuration Resend"
    echo "====================="
    echo ""
    echo "1. Allez sur https://resend.com"
    echo "2. Créez un compte"
    echo "3. Allez à 'API Keys'"
    echo "4. Créez une nouvelle clé"
    echo "5. Copiez la clé (commence par 're_')"
    echo ""
    read -p "Collez votre clé API Resend: " api_key
    
    echo ""
    echo "⏳ Ajout de la clé à Supabase..."
    supabase secrets set RESEND_API_KEY="$api_key"
    
    if [ $? -eq 0 ]; then
        echo "✅ Clé Resend ajoutée avec succès"
    else
        echo "❌ Erreur lors de l'ajout de la clé"
        exit 1
    fi

elif [ "$choice" = "2" ]; then
    echo ""
    echo "📧 Configuration SendGrid"
    echo "========================"
    echo ""
    echo "1. Allez sur https://sendgrid.com"
    echo "2. Créez un compte"
    echo "3. Allez à Settings > API Keys"
    echo "4. Créez une nouvelle clé avec permission 'Mail Send'"
    echo "5. Copiez la clé (commence par 'SG.')"
    echo ""
    read -p "Collez votre clé API SendGrid: " api_key
    
    echo ""
    echo "⏳ Ajout de la clé à Supabase..."
    supabase secrets set SENDGRID_API_KEY="$api_key"
    
    if [ $? -eq 0 ]; then
        echo "✅ Clé SendGrid ajoutée avec succès"
    else
        echo "❌ Erreur lors de l'ajout de la clé"
        exit 1
    fi
else
    echo "❌ Choix invalide"
    exit 1
fi

echo ""
echo "⏳ Déploiement de la fonction Edge..."
echo ""
supabase functions deploy send-reset-code

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Fonction déployée avec succès!"
    echo ""
    echo "🎉 Configuration complète!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Attendez 30-60 secondes pour la propagation"
    echo "2. Allez à http://localhost:5173/forgot-password"
    echo "3. Entrez votre email"
    echo "4. Vérifiez votre inbox"
    echo "5. Vous devriez recevoir un email avec le code ✉️"
    echo ""
    echo "📊 Vérifier le statut:"
    echo "   supabase functions list"
    echo ""
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
