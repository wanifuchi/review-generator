<?php
/**
 * とね屋口コミシステム設定ファイル
 */

// メール設定
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'your-email@gmail.com'); // 実際のGmailアドレスに変更
define('MAIL_PASSWORD', 'your-app-password');    // Gmailアプリパスワードに変更
define('MAIL_FROM_EMAIL', 'your-email@gmail.com');
define('MAIL_FROM_NAME', 'とね屋口コミシステム');

// 受信者設定
define('MAIL_TO_EMAIL', 'info@toneya.co.jp');

// デバッグ設定
define('DEBUG_MODE', true); // 本番環境では false に設定

// エラーログ設定
if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');
?>