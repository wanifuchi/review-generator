<?php
/**
 * PHPMailer自動ダウンロードスクリプト（XSERVER用）
 * 
 * 使用方法：
 * 1. このファイルをサーバーにアップロード
 * 2. ブラウザで http://yourdomain.com/download_phpmailer.php にアクセス
 * 3. 自動的にPHPMailerがダウンロード・設置される
 */

// セキュリティ：本番環境では削除推奨
if (file_exists('PHPMailer/src/PHPMailer.php')) {
    echo "✅ PHPMailerは既にインストール済みです。<br>";
    echo "📧 <a href='index.php'>メインページに戻る</a>";
    exit;
}

echo "<h2>🚀 PHPMailer自動インストール（XSERVER用）</h2>";
echo "<p>⏳ PHPMailerをダウンロード中...</p>";

// PHPMailer GitHub Release URL
$phpmailer_url = 'https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v6.8.0.zip';
$zip_file = 'phpmailer.zip';
$extract_dir = 'PHPMailer-temp';

try {
    // 1. ZIPファイルダウンロード
    echo "<p>📥 ダウンロード中: {$phpmailer_url}</p>";
    $zip_content = file_get_contents($phpmailer_url);
    
    if ($zip_content === false) {
        throw new Exception('PHPMailerのダウンロードに失敗しました');
    }
    
    file_put_contents($zip_file, $zip_content);
    echo "<p>✅ ダウンロード完了</p>";
    
    // 2. ZIPファイル展開
    if (!class_exists('ZipArchive')) {
        throw new Exception('ZipArchiveクラスが利用できません');
    }
    
    $zip = new ZipArchive;
    if ($zip->open($zip_file) === TRUE) {
        echo "<p>📂 ZIPファイルを展開中...</p>";
        $zip->extractTo('.');
        $zip->close();
        echo "<p>✅ 展開完了</p>";
    } else {
        throw new Exception('ZIPファイルの展開に失敗しました');
    }
    
    // 3. ディレクトリ移動・整理
    $source_dir = 'PHPMailer-6.8.0';
    $target_dir = 'PHPMailer';
    
    if (is_dir($source_dir)) {
        rename($source_dir, $target_dir);
        echo "<p>📁 ディレクトリを整理中...</p>";
    }
    
    // 4. 不要ファイル削除
    unlink($zip_file);
    echo "<p>🗑️ 一時ファイルを削除</p>";
    
    // 5. 動作確認
    if (file_exists('PHPMailer/src/PHPMailer.php')) {
        echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
        echo "<h3 style='color: #155724; margin: 0;'>🎉 インストール完了！</h3>";
        echo "<p style='color: #155724; margin: 10px 0 0 0;'>PHPMailerが正常にインストールされました。</p>";
        echo "</div>";
        
        echo "<h3>📋 次のステップ</h3>";
        echo "<ol>";
        echo "<li><strong>config.php</strong> でGmail設定を行う</li>";
        echo "<li><a href='index.php'><strong>メインページ</strong></a>で動作テストを行う</li>";
        echo "<li>このファイル（download_phpmailer.php）を削除する</li>";
        echo "</ol>";
        
        echo "<h3>🔧 必要な設定</h3>";
        echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;'>";
        echo "config.php の編集箇所:\n\n";
        echo "define('MAIL_USERNAME', 'your-email@gmail.com');     // Gmail アドレス\n";
        echo "define('MAIL_PASSWORD', 'your-app-password');        // アプリパスワード\n";
        echo "define('MAIL_FROM_EMAIL', 'your-email@gmail.com');   // 送信者アドレス";
        echo "</pre>";
        
    } else {
        throw new Exception('PHPMailerファイルが見つかりません');
    }
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h3 style='color: #721c24; margin: 0;'>❌ エラーが発生しました</h3>";
    echo "<p style='color: #721c24; margin: 10px 0 0 0;'>{$e->getMessage()}</p>";
    echo "</div>";
    
    echo "<h3>🛠️ 手動インストール手順</h3>";
    echo "<ol>";
    echo "<li><a href='https://github.com/PHPMailer/PHPMailer/releases' target='_blank'>PHPMailer GitHub</a> からダウンロード</li>";
    echo "<li>ZIPファイルを展開</li>";
    echo "<li><code>PHPMailer</code> フォルダにリネーム</li>";
    echo "<li>サーバーにアップロード</li>";
    echo "</ol>";
}

echo "<hr style='margin: 30px 0;'>";
echo "<p><small>🎋 とね屋口コミ生成システム - PHPMailer自動インストーラー</small></p>";
?>