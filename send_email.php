<?php
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

// バリデーション
if (!$data || !isset($data['to']) || !isset($data['subject']) || !isset($data['body'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: to, subject, body']);
    exit();
}

$to = filter_var($data['to'], FILTER_VALIDATE_EMAIL);
$subject = htmlspecialchars($data['subject'], ENT_QUOTES, 'UTF-8');
$body = htmlspecialchars($data['body'], ENT_QUOTES, 'UTF-8');

if (!$to) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

// メール送信設定
$from = 'noreply@toneya-review.com'; // 送信者アドレス
$headers = array(
    'From' => $from,
    'Reply-To' => $from,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/html; charset=utf-8',
    'MIME-Version' => '1.0'
);

// HTMLメール本文を作成
$html_body = "
<!DOCTYPE html>
<html lang='ja'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>新しい口コミ投稿</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;'>
        <h1 style='color: white; text-align: center; margin: 0;'>新しい口コミ投稿</h1>
    </div>
    
    <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;'>
        <h2 style='color: #333; margin-top: 0;'>口コミ内容</h2>
        <div style='background: white; padding: 15px; border-radius: 5px; margin: 10px 0;'>
            <pre style='white-space: pre-wrap; font-family: inherit; margin: 0; line-height: 1.6;'>" . $body . "</pre>
        </div>
    </div>
    
    <div style='text-align: center; margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;'>
        <p style='color: #1976d2; margin: 0; font-size: 14px;'>
            📧 このメールは口コミ生成ツールから自動送信されました
        </p>
        <p style='color: #666; margin: 5px 0 0 0; font-size: 12px;'>
            送信日時: " . date('Y年m月d日 H:i:s') . "
        </p>
    </div>
</body>
</html>
";

// ヘッダー文字列を作成
$header_string = '';
foreach ($headers as $key => $value) {
    $header_string .= $key . ': ' . $value . "\r\n";
}

try {
    // メール送信実行
    $result = mail($to, $subject, $html_body, $header_string);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'メールが正常に送信されました',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        throw new Exception('mail() function failed');
    }
    
} catch (Exception $e) {
    error_log('Email sending error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'メール送信に失敗しました',
        'details' => 'サーバー側でエラーが発生しました'
    ]);
}
?>