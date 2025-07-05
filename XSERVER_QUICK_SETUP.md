# 🚀 XSERVER 即動作セットアップ（3分完了）

## ⚡ 超簡単3ステップ

### STEP 1: ファイルアップロード（1分）

1. **XSERVER ファイルマネージャー**にログイン
2. **ドメイン選択** → **public_html**フォルダを開く
3. **全ファイルをドラッグ&ドロップ**でアップロード

### STEP 2: 設定変更（1分）

`config.php`ファイルを編集：

#### 🔧 変更箇所（3行だけ）
```php
// 9行目
define('MAIL_USERNAME', 'your-email@gmail.com'); // ← 実際のGmail

// 10行目  
define('MAIL_PASSWORD', 'your-app-password');    // ← Gmailアプリパスワード

// 11行目
define('MAIL_FROM_EMAIL', 'your-email@gmail.com'); // ← 送信者アドレス
```

#### 📧 Gmailアプリパスワード取得（30秒）
1. [Googleアカウント](https://myaccount.google.com/) → セキュリティ
2. 2段階認証 → アプリパスワード
3. 「メール」→「その他」→「とね屋システム」
4. **16桁パスワード**をコピー

### STEP 3: 動作確認（1分）

1. `https://yourdomain.com/index.php` にアクセス
2. ⭐評価選択 → 🏷️タグ選択 → 🤖AI生成 → 📧投稿
3. `info@toneya.co.jp` にメール到着確認

---

## ✅ 完了！

これだけで即座に動作します！

### 🎯 システムURL
- **メインページ**: `https://yourdomain.com/index.php`
- **サンクスページ**: `https://yourdomain.com/thanks.php`

### 📧 メール送信先
- **受信者**: `info@toneya.co.jp`
- **形式**: 評価・タグ・口コミ内容を含む整形メール

---

## 🛠️ トラブル時の対処

### メールが届かない場合

#### 1. 設定確認
```bash
# XSERVER ファイルマネージャーで config.php を開いて確認
MAIL_USERNAME: 正しいGmailアドレス？
MAIL_PASSWORD: 16桁のアプリパスワード？
```

#### 2. Gmailアプリパスワード再生成
- 古いパスワードを削除
- 新しいアプリパスワードを生成
- `config.php` を更新

#### 3. エラーログ確認
```
XSERVER管理パネル → ログ → エラーログ
```

### 画面が表示されない場合

#### 1. ファイル確認
```
public_html/
├── index.php          ✅ 必須
├── thanks.php         ✅ 必須  
├── config.php         ✅ 必須
├── styles.css         ✅ 必須
├── thanks-styles.css  ✅ 必須
└── logo.png           ✅ 必須
```

#### 2. PHP版本確認
```
XSERVER管理パネル → PHP Ver.切替 → PHP8.0以上を選択
```

---

## 🎉 XSERVERで完璧動作！

**アップロード即動作**の完全PHPシステムです！

*🎋 とね屋口コミ生成システム XSERVER版*