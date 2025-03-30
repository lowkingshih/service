#!/bin/bash

# 設定嚴格模式
set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日誌函數
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# 檢查必要的環境變數
check_env() {
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        error "SUPABASE_PROJECT_ID is not set"
    fi
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        error "SUPABASE_ACCESS_TOKEN is not set"
    fi
}

# 檢查必要的命令
check_dependencies() {
    if ! command -v supabase &> /dev/null; then
        error "supabase CLI is not installed"
    fi
}

# 主要部署流程
deploy() {
    log "Starting deployment process..."
    
    # 登入 Supabase CLI
    log "Logging in to Supabase..."
    echo "$SUPABASE_ACCESS_TOKEN" | supabase login
    
    # 連結專案
    log "Linking project..."
    supabase link --project-ref "$SUPABASE_PROJECT_ID"
    
    # 推送資料庫變更
    log "Pushing database changes..."
    supabase db push
    
    # 部署 Edge Functions（如果存在）
    if [ -d "supabase/functions" ]; then
        log "Deploying Edge Functions..."
        for func in supabase/functions/*; do
            if [ -d "$func" ]; then
                func_name=$(basename "$func")
                log "Deploying function: $func_name"
                supabase functions deploy "$func_name"
            fi
        done
    fi
    
    log "Deployment completed successfully!"
}

# 主要執行流程
main() {
    log "Starting deployment script..."
    
    # 檢查環境和依賴
    check_env
    check_dependencies
    
    # 執行部署
    deploy
}

# 執行主程序
main 