# Setup script for Pipeline AI Integration Manager (Windows)
# ===========================================================

Write-Host "🚀 Setting up Pipeline AI Integration Manager..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "README.md")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Setting up Python virtual environment..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& .\venv\Scripts\Activate.ps1

Write-Host "Step 2: Installing Python dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "Step 3: Setting up frontend..." -ForegroundColor Yellow
Set-Location ..\frontend
if (-not (Test-Path "node_modules")) {
    npm install
}

Write-Host "Step 4: Creating environment file..." -ForegroundColor Yellow
Set-Location ..
if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
    Write-Host "Created .env file. Please edit it with your credentials." -ForegroundColor Green
}

Write-Host "Step 5: Checking Redis..." -ForegroundColor Yellow
$redisRunning = docker ps | Select-String "redis"
if (-not $redisRunning) {
    docker run -d --name pipeline-redis -p 6379:6379 redis:7-alpine 2>$null
    if (-not $?) {
        docker start pipeline-redis 2>$null
    }
    if (-not $?) {
        Write-Host "Please start Redis manually or install Docker" -ForegroundColor Yellow
    }
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your OAuth credentials"
Write-Host "2. Start backend: cd backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload"
Write-Host "3. Start frontend: cd frontend; npm start"
Write-Host "4. Open http://localhost:3000 in your browser"
