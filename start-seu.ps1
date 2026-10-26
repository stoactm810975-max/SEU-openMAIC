# =====================================================================
# 东南大学·硬核基础课交互式知识图谱与多智能体伴学平台 (SEU-OpenMAIC)
# 快速启动引擎 (PowerShell 增强版)
# =====================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$targetUrl = "http://localhost:3000/seu-graph"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   [SEU-OpenMAIC] 东南大学交互式知识图谱与伴学平台快速启动器" -ForegroundColor Cyan
Write-Host "   校区体系: 四牌楼 · 九龙湖 · 丁家桥" -ForegroundColor DarkCyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. 确保进入项目根目录
Set-Location -Path $PSScriptRoot

# 2. 检查 .env.local 配置文件
$envFile = Join-Path $PSScriptRoot ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "[配置] 首次运行，正在自动创建基础配置文件 .env.local ..." -ForegroundColor Yellow
    @"
# OpenMAIC 本地开发与东大图谱演示环境配置
DATABASE_URL=postgres://openmaic:openmaic-dev@127.0.0.1:5432/openmaic
DEEPSEEK_API_KEY=mock-key-for-seu-graph-demo
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "[完成] .env.local 已生成。" -ForegroundColor Green
} else {
    Write-Host "[就绪] .env.local 配置文件已就绪。" -ForegroundColor Green
}

# 3. 检查 3000 端口是否已经在运行中
$alreadyRunning = $false
try {
    $check = Invoke-WebRequest -Uri $targetUrl -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
    if ($check.StatusCode -eq 200) {
        $alreadyRunning = $true
    }
} catch {
    $alreadyRunning = $false
}

if ($alreadyRunning) {
    Write-Host "[发现] 检测到平台服务已在后台运行中 (端口 3000)" -ForegroundColor Green
    Write-Host "[打开] 正在直接唤起默认浏览器访问: $targetUrl" -ForegroundColor Cyan
    Start-Process $targetUrl
    Write-Host ""
    Write-Host "平台已在浏览器中打开！如需停止后台服务，可关闭对应的控制台窗口。" -ForegroundColor DarkGray
    Start-Sleep -Seconds 3
    exit 0
}

# 4. 异步监听服务健康并在编译完成后自动打开浏览器
Write-Host "[监听] 正在启动后台健康探测，待服务就绪将自动唤起浏览器..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    param($url)
    $maxTries = 40
    $count = 0
    while ($count -lt $maxTries) {
        Start-Sleep -Seconds 2
        try {
            $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                Start-Process $url
                break
            }
        } catch {
            # 继续等待 Next.js 编译
        }
        $count++
    }
} -ArgumentList $targetUrl | Out-Null

# 5. 启动 Next.js 极速开发服务
Write-Host "[启动] 正在拉起 Next.js 引擎 (端口: 3000) ..." -ForegroundColor Green
Write-Host "[提示] 访问地址: $targetUrl" -ForegroundColor Yellow
Write-Host ""

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm dev
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    npm run dev
} else {
    Write-Host "[错误] 未检测到 pnpm 或 npm，请先安装 Node.js！" -ForegroundColor Red
    pause
}