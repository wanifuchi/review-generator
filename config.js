// 環境設定
window.APP_CONFIG = {
  // 本番環境のAPIエンドポイント（Railway）
  API_URL: 'https://review-generator-production.up.railway.app',
  
  // 開発環境設定
  DEV_API_URL: 'http://localhost:3001',
  
  // アプリケーション設定
  APP_NAME: 'となりや葬儀社 口コミ生成ツール',
  VERSION: '2.0.0',
  
  // 機能フラグ
  FEATURES: {
    BACKEND_API: true,
    LOCAL_GENERATION: true,
    ANALYTICS: false
  }
};