#!/bin/bash
# ============================================
# QUICK VERCEL ENV IMPORT
# ============================================
# Automatically add all env vars to Vercel

echo "🚀 Quick Vercel Environment Variables Import"
echo "============================================"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found!"
    echo "📝 Creating from template..."
    
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo "✅ Created .env.production"
        echo "⚠️  Please fill in the values and run again!"
        exit 0
    else
        echo "❌ Template not found!"
        exit 1
    fi
fi

echo "✅ Found .env.production"
echo ""

# Read and add each variable
echo "📦 Adding environment variables to Vercel..."
echo ""

while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
        continue
    fi
    
    # Skip placeholders
    if [[ $value =~ ^YOUR_.*$ ]] || [[ $value =~ ^your-.*$ ]]; then
        continue
    fi
    
    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [[ -n $key ]] && [[ -n $value ]]; then
        echo "➕ Adding $key..."
        echo "$value" | vercel env add "$key" production
    fi
done < .env.production

echo ""
echo "============================================"
echo "✅ Done! Environment variables added to Vercel"
echo ""
echo "🎯 Next steps:"
echo "   1. Check: vercel env ls"
echo "   2. Deploy: vercel --prod"
echo "   3. View logs: vercel logs"
echo ""
echo "🌐 Dashboard: https://vercel.com/manhlhs-projects/financial-management-application"
echo ""
