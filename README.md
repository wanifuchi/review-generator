# とね屋 口コミ生成ツール

## 概要
このプロジェクトは、とね屋の口コミを簡単に生成できるWebアプリケーションです。ユーザーは星評価と関連するサービスタグを選択し、AIによって自動的に人間らしい自然な口コミテキストを生成できます。

## 🚀 新機能：OpenAI連携
**OpenAI GPT-4と連携し、人間が実際に書いたような自然で一貫性のある口コミを生成できます。**

### 🏗️ アーキテクチャ
- **フロントエンド**: Vercel（静的サイト）
- **バックエンド**: Railway（Node.js + Express）
- **AI**: OpenAI GPT-4（バックエンドで安全に管理）

## 主な機能

### 1. 🌟 インテリジェントな星評価システム
- 1-5つ星の評価を選択可能
- 評価レベルに応じた感情トーンの自動調整
- 選択した星が金色でハイライト表示

### 2. 🏷️ スマートタグ選択
- 複数選択可能な12種類のサービスタグ
- 斎場、家族葬、海洋散骨、墓じまい、永代供養、樹木葬、遺品整理、終活相談、献花納棺、別れの儀、感動、スタッフの対応
- タグに基づく具体的なエピソード生成

### 3. 🤖 高度なAI口コミ生成
**2つの生成モード:**
- **🔥 APIモード（推奨）**: Google Gemini Proを使用した無料の自然な文章生成
- **⚡ ローカルモード**: オフラインでも動作する改良されたテンプレート生成

**特徴:**
- 人間が実際に書いたような自然な表現
- 評価とタグに基づく論理的に一貫した内容
- 感情の自然な流れを表現
- 150-250文字の適切な長さ
- AIが生成したとバレない高品質な文章

### 4. 📧 統合された投稿機能
- 口コミ投稿ボタン一つで以下を実行：
  - メール送信（info@toneya.co.jp）
  - クリップボードへの自動コピー
  - Google口コミページへの自動遷移
  - 成功通知

## デプロイ方法

### 前提条件
- [GitHub](https://github.com/) アカウント
- [Vercel](https://vercel.com/) アカウント
- [Railway](https://railway.app/) アカウント
- [OpenAI Platform](https://platform.openai.com/) アカウントとOpenAI APIキー

### 1. バックエンドデプロイ（Railway）

1. **Railway プロジェクト作成**
   - [Railway Console](https://railway.app/dashboard) にログイン
   - "New Project" → "Deploy from GitHub repo"
   - `api` フォルダーを指定

2. **環境変数設定**
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

### 2. フロントエンドデプロイ（Vercel）

1. **API URL設定**
   - `config.js` の `API_URL` を Railway URLに更新

2. **Vercel プロジェクト作成**
   - [Vercel Dashboard](https://vercel.com/dashboard) にログイン
   - "New Project" → GitHub リポジトリを選択
   - Root Directory: `enquete`

## 使用方法

1. **評価選択**: 1-5つ星から選択
2. **タグ選択**: 該当するサービスタグを複数選択
3. **AI生成**: 「AI口コミ生成」ボタンで高品質なレビュー生成
4. **編集**: 生成されたテキストは自由に編集可能
5. **投稿**: 「口コミを投稿」ボタンで一括処理

## 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **バックエンド**: Node.js, Express
- **AI**: OpenAI GPT-4
- **デプロイ**: Vercel + Railway

## ライセンス
MIT License