# Deploy Ginuma Backend with Customer Sync Feature

$ErrorActionPreference = "Stop"

Write-Host "🔨 Building Docker image..." -ForegroundColor Cyan
docker build -t 22it0489/ginuma-backend:latest ginum-backend-main/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image built successfully" -ForegroundColor Green

Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Cyan
docker push 22it0489/ginuma-backend:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image pushed to Docker Hub" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps on DigitalOcean:" -ForegroundColor Yellow
Write-Host "   1. SSH to droplet: ssh root@167.71.206.166"
Write-Host "   2. Navigate: cd /app/ginuma-system"
Write-Host "   3. Redeploy: docker compose up -d --force-recreate ginum-backend"
Write-Host "   4. Check logs: docker compose logs ginum-backend -f"
