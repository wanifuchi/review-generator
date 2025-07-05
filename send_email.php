<?php
// PHPMailer を使用したメール送信システム
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Composer autoload または手動include
if (file_exists('vendor/autoload.php')) {
    require 'vendor/autoload.php';
} else {
    // PHPMailer手動インクルード（Composerなしの場合）
    require_once 'PHPMailer/src/Exception.php';
    require_once 'PHPMailer/src/PHPMailer.php';
    require_once 'PHPMailer/src/SMTP.php';
}

// CORS ヘッダー設定
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight request への対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// POSTリクエストのみ受け付け
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// JSONデータを受信
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// ログ出力（デバッグ用）
error_log('=== Email Request ===');
error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Request data: ' . json_encode($data));

// バリデーション
if (!$data || !isset($data['to']) || !isset($data['subject']) || !isset($data['body'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: to, subject, body']);
    error_log('Missing required fields');
    exit();
}

$to = filter_var($data['to'], FILTER_VALIDATE_EMAIL);
$subject = htmlspecialchars($data['subject'], ENT_QUOTES, 'UTF-8');
$body = htmlspecialchars($data['body'], ENT_QUOTES, 'UTF-8');

if (!$to) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    error_log('Invalid email address: ' . $data['to']);
    exit();
}

try {
    // PHPMailer インスタンス作成
    $mail = new PHPMailer(true);

    // SMTP設定
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com'; // Gmail SMTP
    $mail->SMTPAuth   = true;
    $mail->Username   = 'your-email@gmail.com'; // 実際のGmailアドレスに変更
    $mail->Password   = 'your-app-password';    // Gmailアプリパスワードに変更
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // 送信者設定
    $mail->setFrom('your-email@gmail.com', 'とね屋口コミシステム');
    $mail->addReplyTo('your-email@gmail.com', 'とね屋口コミシステム');

    // 受信者設定
    $mail->addAddress($to);

    // メール内容設定
    $mail->isHTML(true);
    $mail->Subject = $subject;
    
    // HTMLメール本文
    $htmlBody = "
    <!DOCTYPE html>
    <html lang='ja'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>新しい口コミ投稿</title>
    </head>
    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;'>
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center;'>
            <h1 style='color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);'>🎋 新しい口コミ投稿</h1>
            <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;'>とね屋口コミ生成ツールより</p>
        </div>
        
        <div style='background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-left: 5px solid #667eea;'>
            <h2 style='color: #333; margin-top: 0; font-size: 24px; border-bottom: 2px solid #eee; padding-bottom: 10px;'>📝 口コミ内容</h2>
            <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;'>
                <pre style='white-space: pre-wrap; font-family: inherit; margin: 0; line-height: 1.6; font-size: 16px; color: #495057;'>" . $body . "</pre>
            </div>
        </div>
        
        <div style='background: white; margin-top: 20px; padding: 25px; border-radius: 12px; text-align: center; border: 2px dashed #667eea;'>
            <h3 style='color: #667eea; margin-top: 0; font-size: 20px;'>📋 次のステップ</h3>
            <p style='color: #666; margin: 15px 0; font-size: 16px; line-height: 1.5;'>
                上記の口コミ内容をGoogle口コミページに投稿してください。<br>
                投稿により、サービス向上に貢献していただけます。
            </p>
        </div>
        
        <div style='text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(45deg, #e3f2fd, #f3e5f5); border-radius: 10px;'>
            <p style='color: #1976d2; margin: 0; font-size: 14px; font-weight: bold;'>
                📧 このメールは口コミ生成ツールから自動送信されました
            </p>
            <p style='color: #666; margin: 10px 0 0 0; font-size: 13px;'>
                送信日時: " . date('Y年m月d日(D) H:i:s') . "
            </p>
        </div>
    </body>
    </html>
    ";
    
    $mail->Body = $htmlBody;
    
    // テキスト版も設定（HTMLメール未対応の場合）
    $mail->AltBody = "新しい口コミ投稿\n\n口コミ内容:\n" . $body . "\n\n送信日時: " . date('Y-m-d H:i:s');

    // メール送信
    error_log('Attempting to send email...');
    $mail->send();
    error_log('Email sent successfully');

    // 成功レスポンス
    echo json_encode([
        'success' => true,
        'message' => 'メールが正常に送信されました',
        'timestamp' => date('Y-m-d H:i:s'),
        'to' => $to,
        'subject' => $subject
    ]);

} catch (Exception $e) {
    error_log('Email sending failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'メール送信に失敗しました',
        'details' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>