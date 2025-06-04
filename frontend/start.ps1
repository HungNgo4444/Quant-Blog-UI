# Thiết lập các biến môi trường cần thiết
$env:DATABASE_URL="file:./dev.db"
$env:NEXTAUTH_SECRET="dev-secret-key-change-in-production"
$env:NEXTAUTH_URL="http://localhost:3000"
$env:EMAIL_SERVER_HOST="smtp.gmail.com"
$env:EMAIL_SERVER_PORT="587"
$env:EMAIL_SERVER_USER=""
$env:EMAIL_SERVER_PASSWORD=""
$env:EMAIL_FROM="noreply@example.com"
$env:JWT_SECRET="dev-jwt-secret-change-in-production"

# Khởi động development server
Write-Host "Starting Blog System..." -ForegroundColor Green
Write-Host "Visit: http://localhost:3000" -ForegroundColor Cyan
npm run dev 