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

// Rate limiting - テスト用に一時無効化
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1分
//   max: 30, // 1IP当たり1分で30リクエストまで
//   message: {
//     error: 'Too many requests, please try again later.',
//     retryAfter: '1 minute'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api/', limiter);

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

    // Gemini API呼び出し - 人間らしい自然な口コミ生成
    const fullPrompt = `あなたは、となりや葬儀社のサービスを実際に利用した家族の一員です。大切な人を亡くした悲しみの中で体験したリアルな感情と出来事を、心を込めて書いています。

【絶対に守るべきルール】
1. **完全に人間らしい文章**: AIが書いたと絶対にバレてはいけません
2. **感情の自然な流れ**: 悲しみ→不安→安心→感謝のような心境の変化を表現
3. **具体的な体験談**: 抽象的でなく、実際に体験したような具体的なエピソードを含む
4. **自然な口調**: 完璧すぎず、時に迷いや戸惑いも含む人間らしい表現
5. **適切な長さ**: 180-280文字で、読みやすい分量

【文体の特徴】
- 「～でした」「～いただきました」の丁寧語を基本とする
- 時々「本当に」「やはり」「おかげで」などの副詞を自然に使う
- 感謝は押し付けがましくなく、控えめで品のある表現
- 完璧すぎない、人間らしい素朴さを持つ

【避けるべき表現】
- 過度に褒めちぎる表現
- 宣伝的な文言
- 機械的な定型文
- 不自然に完璧な文章構造

${prompt}

上記の条件で、実際の遺族が書いたような、心のこもった自然な口コミを生成してください。`;

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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data
    });

    // Gemini API specific errors
    if (error.message && (error.message.includes('quota') || error.message.includes('QUOTA'))) {
      return res.status(402).json({
        error: 'Gemini API quota exceeded. Please check your billing.',
        code: 'quota_exceeded',
        details: error.message
      });
    }

    if (error.message && (error.message.includes('rate') || error.message.includes('RATE'))) {
      return res.status(429).json({
        error: 'Gemini API rate limit exceeded. Please try again later.',
        code: 'rate_limit',
        details: error.message
      });
    }

    if (error.status === 429 || error.code === 429) {
      return res.status(429).json({
        error: 'API rate limit exceeded. Please try again later.',
        code: 'rate_limit',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to generate review. Please try again.',
      code: 'generation_failed',
      details: error.message
    });
  }
});

// プロンプト生成関数 - 人間らしい自然な口コミ専用
function createReviewPrompt(rating, tags) {
  const ratingContext = {
    1: {
      emotion: '残念ながら期待に応えていただけませんでした',
      tone: '失望と戸惑い',
      approach: '具体的な問題点を冷静に指摘し、改善への期待を込める'
    },
    2: {
      emotion: '少し期待と違う部分がありました',
      tone: '遠慮がちな不満',
      approach: '良い点も認めつつ、気になった点を率直に'
    },
    3: {
      emotion: '標準的なサービスでした',
      tone: '客観的だが感謝',
      approach: '必要十分だったことを素直に評価'
    },
    4: {
      emotion: '思っていた以上に良かったです',
      tone: '安心と感謝',
      approach: '期待を上回った点を具体的に、感謝を込めて'
    },
    5: {
      emotion: '本当に心から感謝しています',
      tone: '深い感動と安心',
      approach: '特に印象的だった場面を交えて、心からの感謝を表現'
    }
  };

  const serviceDetails = {
    '斎場': {
      low: '施設の使い勝手や環境',
      high: '荘厳で落ち着いた斎場の雰囲気や設備'
    },
    '家族葬': {
      low: '家族だけの葬儀の進行',
      high: 'アットホームで心温まる家族葬の配慮'
    },
    '海洋散骨': {
      low: '海洋散骨の手続きや実施',
      high: '故人の意思を尊重した海洋散骨の丁寧な対応'
    },
    'スタッフの対応': {
      low: 'スタッフの基本的な対応',
      high: 'スタッフの方々の心配りや細やかな気遣い'
    }
  };

  const tagsText = tags.length > 0 ? tags.join('、') : '葬儀全般';
  const context = ratingContext[rating];
  
  // 主要タグに基づく具体的なサービス内容
  const mainTag = tags[0] || 'スタッフの対応';
  const serviceLevel = rating >= 4 ? 'high' : 'low';
  const serviceDescription = serviceDetails[mainTag] ? 
    serviceDetails[mainTag][serviceLevel] : 'サービス全般';

  return `【シチュエーション】
大切な家族を亡くし、となりや葬儀社に${tagsText}をお願いした遺族の立場

【あなたの心境】
${context.emotion}という状況で、${context.tone}の気持ち

【実際の体験】
- 利用サービス：${tagsText}
- 評価レベル：${rating}つ星
- 重点的に触れるべき点：${serviceDescription}

【書き方の指示】
${context.approach}

【生成すべき口コミの要素】
1. 葬儀を依頼するまでの心境（不安、迷い等）
2. 実際のサービス体験での印象的な場面
3. スタッフとのやり取りでの具体的なエピソード
4. 最終的な心境の変化
5. 他の方への率直な感想

実際の遺族が、友人や知人に体験を話すような自然さで、心に残った出来事を中心に口コミを書いてください。完璧すぎず、人間らしい迷いや感情の揺れも含めて構いません。`;
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