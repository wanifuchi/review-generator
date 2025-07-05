<?php
/**
 * とね屋口コミシステム設定ファイル - XSERVER最適化版
 */

// 🔧 XSERVER用メール設定（要変更）
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'your-email@gmail.com'); // ⚠️ 実際のGmailアドレスに変更
define('MAIL_PASSWORD', 'your-app-password');    // ⚠️ Gmailアプリパスワードに変更
define('MAIL_FROM_EMAIL', 'your-email@gmail.com'); // ⚠️ 送信者アドレス
define('MAIL_FROM_NAME', 'とね屋口コミシステム');

// 📧 受信者設定（通常変更不要）
define('MAIL_TO_EMAIL', 'info@toneya.co.jp');

// 🛠️ XSERVER最適化設定
define('DEBUG_MODE', false); // XSERVERでは false 推奨

// XSERVERでのエラー表示設定
if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');

// XSERVERでのPHPメモリ制限調整
ini_set('memory_limit', '256M');

// XSERVER SSL設定
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    define('SITE_URL', 'https://' . $_SERVER['HTTP_HOST']);
} else {
    define('SITE_URL', 'http://' . $_SERVER['HTTP_HOST']);
}
?>