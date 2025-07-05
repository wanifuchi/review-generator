# とね屋口コミ生成システム - デプロイメント手順

## 必要なファイル一覧

### 🎯 必須ファイル
```
enquete/
├── index.html              # メインページ
├── thanks.html             # サンクスページ
├── script.js               # JavaScript（メイン）
├── thanks-script.js        # JavaScript（サンクス）
├── styles.css              # CSS（メイン）
├── thanks-styles.css       # CSS（サンクス）
├── logo.png                # ロゴ画像
├── send_email.php          # メール送信（PHP）
├── config.php              # 設定ファイル
├── composer.json           # PHP依存関係
└── .htaccess               # Apache設定（オプション）
```

## 📋 デプロイ前の準備

### 1. Gmail設定
1. **Gmailアカウント**を用意
2. **2段階認証**を有効にする
3. **アプリパスワード**を生成
   - Google Account → セキュリティ → アプリパスワード
   - 「メール」アプリを選択して生成

### 2. 設定ファイル更新
`config.php` を編集：
```php
define('MAIL_USERNAME', 'your-actual-email@gmail.com');
define('MAIL_PASSWORD', 'your-16-digit-app-password');
define('MAIL_FROM_EMAIL', 'your-actual-email@gmail.com');
```

## 🚀 デプロイ手順

### Option 1: Composerありのサーバー
1. **ファイルアップロード**
   ```bash
   # FTPまたはファイルマネージャーで全ファイルをアップロード
   ```

2. **Composer実行**
   ```bash
   composer install
   ```

3. **権限設定**
   ```bash
   chmod 755 send_email.php
   chmod 644 config.php
   ```

### Option 2: Composerなしのサーバー
1. **PHPMailer手動ダウンロード**
   - [PHPMailer GitHub](https://github.com/PHPMailer/PHPMailer) からダウンロード
   - `PHPMailer/` ディレクトリに配置

2. **ファイルアップロード**
   ```
   enquete/
   ├── (全ファイル)
   └── PHPMailer/
       ├── src/
       │   ├── PHPMailer.php
       │   ├── SMTP.php
       │   └── Exception.php
       └── ...
   ```

## 🔧 推奨ホスティングサービス

### ✅ 動作確認済み
- **さくらのレンタルサーバー** (スタンダード以上)
- **エックスサーバー** (全プラン)
- **ロリポップ** (ハイスピード以上)
- **ConoHa WING** (全プラン)

### 📋 必要スペック
- **PHP**: 7.4以上
- **SSL**: 対応
- **メール送信**: SMTP対応
- **.htaccess**: 使用可能

## 📧 メール送信テスト

### 1. ブラウザでアクセス
```
https://yourdomain.com/enquete/
```

### 2. 動作確認
1. 星評価を選択
2. タグを選択  
3. AI生成または手動入力
4. 「口コミを投稿」をクリック
5. メールが `info@toneya.co.jp` に届くか確認

### 3. エラー確認
- ブラウザ開発者ツール → Console
- サーバーエラーログを確認

## 🛠 トラブルシューティング

### メールが送信されない場合
1. **Gmail認証確認**
   - アプリパスワードが正しいか
   - 2段階認証が有効か

2. **サーバー設定確認**
   ```php
   // テスト用コード（send_email.php上部に一時追加）
   error_log('PHP version: ' . phpversion());
   error_log('OpenSSL: ' . (extension_loaded('openssl') ? 'OK' : 'NG'));
   ```

3. **ファイル権限確認**
   ```bash
   ls -la send_email.php
   # -rwxr-xr-x のような権限が必要
   ```

### Google口コミページに正しく遷移しない場合
1. **検索結果確認**
   - 「株式会社とね屋」で検索
   - 正しい会社が表示されるか確認

2. **URL調整**
   - `script.js` の `reviewUrls` 配列を調整
   - より具体的な検索語句に変更

## 📞 サポート

デプロイ時に問題が発生した場合：
1. エラーログを確認
2. ブラウザコンソールログを確認  
3. 設定ファイルの値を再確認

---

**🎋 とね屋口コミ生成システム v1.0**  
*Powered by PHP + PHPMailer*