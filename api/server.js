const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティミドルウェア
app.use(helmet());

// CORS設定（Vercelフロントエンド用）
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://*.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 1IP当たり15分で100リクエストまで
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use('/api/', limiter);

// JSON解析
app.use(express.json({ limit: '10mb' }));

// Gemini AI設定
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 口コミ生成API
app.post('/api/generate-review', async (req, res) => {
  try {
    const { rating, tags } = req.body;

    // バリデーション
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating. Must be between 1 and 5.'
      });
    }

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        error: 'Tags must be an array.'
      });
    }

    // プロンプト生成
    const prompt = createReviewPrompt(rating, tags);

    // Gemini API呼び出し
    const fullPrompt = `あなたは、葬儀サービスを実際に利用した家族の立場で、心からの口コミを書いています。

重要なルール：
1. 感情の一貫性を保つ（評価に応じた感情の流れ）
2. 時系列を正しく守る（葬儀→その後の手続きの順序）
3. 選択されたサービスについて具体的に言及する
4. 実際の人間が書いたような自然な表現を使う
5. 150-250文字程度の適切な長さにする
6. AIが生成したとバレないよう、人間らしい感情表現を使う
7. 過度に感情的にならず、適度な敬語を使用する
8. となりや葬儀社への言及を自然に含める

${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedReview = response.text().trim();

    // レスポンス返却
    res.json({
      success: true,
      review: generatedReview,
      metadata: {
        rating,
        tags,
        model: 'gemini-pro',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Review generation error:', error);

    if (error.message && error.message.includes('quota')) {
      return res.status(402).json({
        error: 'Gemini API quota exceeded. Please check your billing.',
        code: 'quota_exceeded'
      });
    }

    if (error.message && error.message.includes('rate')) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        code: 'rate_limit'
      });
    }

    res.status(500).json({
      error: 'Failed to generate review. Please try again.',
      code: 'generation_failed'
    });
  }
});

// プロンプト生成関数
function createReviewPrompt(rating, tags) {
  const ratingDescription = {
    1: '非常に不満（1つ星）',
    2: '不満（2つ星）',
    3: '普通（3つ星）',
    4: '満足（4つ星）',
    5: '非常に満足（5つ星）'
  };

  const tagsText = tags.length > 0 ? tags.join('、') : '一般的な葬儀サービス';

  return `となりや葬儀社のサービスについて、${ratingDescription[rating]}の口コミを書いてください。

利用したサービス：${tagsText}
評価：${rating}つ星

以下の点を考慮して、自然で人間らしい口コミを作成してください：

1. 実際にサービスを利用した家族の視点で書く
2. ${rating}つ星の評価に相応しい感情と内容にする
3. 選択されたサービス（${tagsText}）について具体的に言及する
4. 感情の流れが自然で一貫している
5. 実際の葬儀の流れや時系列を考慮する
6. 過度に褒めすぎず、自然な範囲での評価にする

人間が実際に体験して書いたような、心のこもった口コミをお願いします。`;
}

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404ハンドリング
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;