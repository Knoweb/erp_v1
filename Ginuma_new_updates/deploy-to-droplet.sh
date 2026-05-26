#!/bin/bash
# Deploy Ginuma Backend with Customer Sync Feature to DigitalOcean

set -e

DROPLET_IP="167.71.206.166"
DEPLOYMENT_PATH="/app/ginuma-system"

echo "🚀 Deploying Ginuma Backend to DigitalOcean..."
echo "Droplet: $DROPLET_IP"
echo ""

echo "📦 Step 1: SSH and navigate to deployment folder"
ssh root@$DROPLET_IP "
    set -e
    cd $DEPLOYMENT_PATH
    
    echo '🔨 Step 2: Rebuild backend container with updated code'
    docker compose up -d --force-recreate ginum-backend
    
    echo '⏳ Waiting for backend to start...'
    sleep 5
    
    echo '✅ Checking backend logs...'
    docker compose logs ginum-backend | tail -10
    
    echo ''
    echo '✅ Deployment complete!'
    echo '🔗 API accessible at: http://$DROPLET_IP:3001/ginuma-api'
    echo '📍 Sync endpoint: POST /api/customers/sync/middeniya/16/16'
"

echo ""
echo "✅ Backend deployed successfully!"
echo "🌐 Ginuma accessible at: http://$DROPLET_IP:3001/"
echo ""
echo "Next steps:"
echo "  1. Open http://$DROPLET_IP:3001/ in browser"
echo "  2. Navigate to Customers page"
echo "  3. Click 'Sync Data' button (or auto-syncs on page load)"
echo "  4. Verify customers from Middeniya appear"
