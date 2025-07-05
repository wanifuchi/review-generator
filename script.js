// 状態管理
let state = {
    rating: 0,
    tags: [],
    comment: ''
};

// DOM要素の取得
const starRating = document.getElementById('starRating');
const tagGrid = document.getElementById('tagGrid');
const generateButton = document.getElementById('generateAI');
const commentTextarea = document.getElementById('comment');
const submitButton = document.getElementById('submitReview');
const toast = document.getElementById('toast');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateButtonStates();
});

// イベントリスナーの初期化
function initializeEventListeners() {
    // 星評価のクリック
    if (starRating) starRating.addEventListener('click', handleStarClick);
    
    // タグボタンのクリック
    if (tagGrid) tagGrid.addEventListener('click', handleTagClick);
    
    // AI生成ボタンのクリック
    if (generateButton) generateButton.addEventListener('click', handleGenerateAI);
    
    // コメント入力の監視
    if (commentTextarea) commentTextarea.addEventListener('input', handleCommentChange);
    
    // メール送信ボタンのクリック
    if (submitButton) submitButton.addEventListener('click', handleSubmitReview);
}

// 星評価のクリック処理
function handleStarClick(event) {
    if (event.target.classList.contains('star')) {
        const rating = parseInt(event.target.dataset.rating);
        state.rating = rating;
        
        // 星の表示更新
        updateStarDisplay();
        updateButtonStates();
    }
}

// 星の表示更新
function updateStarDisplay() {
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < state.rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// タグボタンのクリック処理
function handleTagClick(event) {
    if (event.target.classList.contains('tag-button')) {
        const tag = event.target.dataset.tag;
        const button = event.target;
        
        if (state.tags.includes(tag)) {
            // タグを削除
            state.tags = state.tags.filter(t => t !== tag);
            button.classList.remove('selected');
        } else {
            // タグを追加
            state.tags.push(tag);
            button.classList.add('selected');
        }
        
        updateButtonStates();
    }
}

// AI生成ボタンのクリック処理
async function handleGenerateAI() {
    if (!canGenerateAI()) return;
    
    // ローディング状態の設定
    generateButton.classList.add('loading');
    generateButton.disabled = true;
    generateButton.textContent = '生成中...';
    
    try {
        // OpenAI APIを使用してレビューを生成
        const review = await generateReview(state.rating, state.tags);
        state.comment = review;
        commentTextarea.value = review;
        
        showToast('口コミが生成されました！');
    } catch (error) {
        console.error('AI生成エラー:', error);
        showToast('口コミの生成に失敗しました。もう一度お試しください。', 'error');
    } finally {
        // ローディング状態の解除
        generateButton.classList.remove('loading');
        generateButton.disabled = false;
        generateButton.textContent = 'AI口コミ生成';
        updateButtonStates();
    }
}

// AI口コミ生成（バックエンドAPI使用）
async function generateReview(rating, tags) {
    try {
        return await generateReviewWithBackend(rating, tags);
    } catch (error) {
        console.error('Backend API Error:', error);
        // バックエンドエラー時はローカル生成にフォールバック
        return generateReviewLocally(rating, tags);
    }
}

// バックエンドAPIを使用した自然な口コミ生成
async function generateReviewWithBackend(rating, tags) {
    const apiUrl = getAPIUrl();
    
    const response = await fetch(`${apiUrl}/api/generate-review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            rating,
            tags
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.review) {
        return data.review;
    } else {
        throw new Error('Invalid response format');
    }
}

// API URLを取得（環境に応じて）
function getAPIUrl() {
    // 設定ファイルから取得
    const config = window.APP_CONFIG;
    
    // 本番環境
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return config?.API_URL || 'https://your-railway-app.railway.app';
    }
    
    // ローカル開発環境
    return config?.DEV_API_URL || 'http://localhost:3001';
}

// 改良されたローカル生成（論理的一貫性を重視）
function generateReviewLocally(rating, tags) {
    // 評価レベルに基づく基本テンプレート
    const templates = {
        1: {
            start: ['この度はお世話になりました。', '先日利用させていただきました。'],
            problem: '#{service}について、#{issue}という点で残念に思いました。',
            result: '#{negative_result}',
            conclusion: '今後の改善に期待しています。'
        },
        2: {
            start: ['#{family}でお世話になりました。', '家族の大切な時にお世話になりました。'],
            mixed: '#{service}については#{positive}でしたが、#{negative}という点が気になりました。',
            result: '全体的には#{mixed_result}',
            conclusion: 'もう少し改善されれば、より良いサービスになると思います。'
        },
        3: {
            start: ['#{family}でお世話になりました。', 'この度はお世話になりました。'],
            service: '#{service}について、#{neutral_experience}',
            result: '#{neutral_result}',
            conclusion: '必要な対応はしていただけました。'
        },
        4: {
            start: ['#{family}で大変お世話になりました。', '家族の大切な時にお世話になりました。'],
            positive: '#{service}では、#{positive_experience}',
            gratitude: '#{positive_emotion}',
            conclusion: 'ありがとうございました。また機会があればお願いしたいです。'
        },
        5: {
            start: ['#{family}で本当にお世話になりました。', '家族の最も大切な時にお世話になりました。'],
            excellent: '#{service}において、#{excellent_experience}',
            emotion: '#{deep_gratitude}',
            conclusion: '心から感謝しております。必ず知人にも紹介させていただきます。'
        }
    };
    
    // 動的な要素を生成
    const variables = generateVariables(rating, tags);
    
    // テンプレートを選択し、変数を置換
    const template = templates[rating] || templates[3];
    let review = '';
    
    Object.values(template).forEach(part => {
        if (review) review += '';
        review += replacePlaceholders(part, variables);
    });
    
    return review.trim();
}

// 変数生成（評価とタグに基づく）
function generateVariables(rating, tags) {
    const families = ['父の葬儀', '母の葬儀', '祖父の葬儀', '祖母の葬儀'];
    const family = families[Math.floor(Math.random() * families.length)];
    
    // タグに基づくサービス記述
    const serviceDescriptions = {
        'スタッフの対応': {
            high: 'スタッフの方々の温かい対応',
            low: 'スタッフの対応'
        },
        '家族葬': {
            high: '家族葬のプラン',
            low: '家族葬'
        },
        '海洋散骨': {
            high: '海洋散骨のサービス',
            low: '海洋散骨'
        },
        '斎場': {
            high: '斎場での式',
            low: '斎場の利用'
        }
    };
    
    const mainTag = tags[0] || 'スタッフの対応';
    const service = serviceDescriptions[mainTag] ? 
        (rating >= 4 ? serviceDescriptions[mainTag].high : serviceDescriptions[mainTag].low) : 
        'サービス';
    
    // 評価レベル別の体験記述
    const experiences = {
        1: {
            issue: '説明が不十分だった',
            negative_result: '不安が残る結果となりました。'
        },
        2: {
            positive: '基本的な対応はしていただけました',
            negative: '説明が分かりにくい部分がありました',
            mixed_result: '可もなく不可もなくといった印象です。'
        },
        3: {
            neutral_experience: '標準的な対応をしていただきました。',
            neutral_result: '特に問題なく進めることができました。'
        },
        4: {
            positive_experience: '期待以上の丁寧な対応をしていただきました',
            positive_emotion: '安心してお任せすることができました。'
        },
        5: {
            excellent_experience: '想像以上に心のこもった対応をしていただき',
            deep_gratitude: '家族一同、深く感動いたしました。'
        }
    };
    
    return {
        family,
        service,
        ...experiences[rating]
    };
}

// プレースホルダー置換
function replacePlaceholders(text, variables) {
    if (typeof text !== 'string') return '';
    
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
            result = result.replace(new RegExp(`#{${key}}`, 'g'), value);
        }
    });
    return result;
}

// Google口コミページを開く（複数URL対応）
function openGoogleReviewPage() {
    // 株式会社とね屋のPlace ID
    const placeId = 'ChIJd7Xr_jlvGGARVQv1VUUc_Fw';
    
    // 複数のGoogle口コミURL形式を試行
    const reviewUrls = [
        // 1. Google Local Review (最も確実)
        `https://search.google.com/local/writereview?placeid=${placeId}`,
        
        // 2. Google Maps Review (モバイル対応)
        `https://www.google.com/maps/place/?q=place_id:${placeId}&hl=ja&gl=JP`,
        
        // 3. フォールバック：会社名での検索
        'https://www.google.com/search?q=%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%E3%81%A8%E3%81%AD%E5%B1%8B+%E3%82%AF%E3%83%81%E3%82%B3%E3%83%9F'
    ];
    
    // 最初のURLを開く（最も確実性が高い）
    const targetUrl = reviewUrls[0];
    
    try {
        // 新しいタブで開く
        const newWindow = window.open(targetUrl, '_blank');
        
        // ポップアップブロック対策
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // ポップアップがブロックされた場合の代替手段
            window.location.href = targetUrl;
        }
        
        console.log('Google口コミページを開きました:', targetUrl);
        
    } catch (error) {
        console.error('Google口コミページを開けませんでした:', error);
        // エラー時は検索ページにフォールバック
        window.open(reviewUrls[2], '_blank');
    }
}

// コメント入力の処理
function handleCommentChange(event) {
    state.comment = event.target.value;
    updateButtonStates();
}

// 口コミ投稿ボタンのクリック処理（メール送信 + Google口コミ遷移）
async function handleSubmitReview() {
    if (!canSubmitReview()) return;
    
    // バリデーション
    if (state.rating === 0) {
        showToast('評価を選択してください', 'error');
        return;
    }
    
    if (state.comment.trim() === '') {
        showToast('コメントを入力してください', 'error');
        return;
    }
    
    // ローディング状態
    submitButton.disabled = true;
    submitButton.textContent = '投稿中...';
    
    try {
        // 1. メール送信
        await sendEmail({
            to: 'feedback@toneya-sougi.co.jp',
            subject: `新しい口コミ - ${state.rating}★`,
            body: `評価: ${state.rating}つ星\nタグ: ${state.tags.join(', ')}\n\n口コミ内容:\n${state.comment}`
        });
        
        // 2. クリップボードにコピー
        await copyToClipboard(state.comment);
        
        // 3. Google口コミページに遷移
        // 株式会社とね屋のGoogleマップ口コミ投稿ページに直接リンク
        openGoogleReviewPage();
        
        // 4. 成功メッセージ
        showToast('メール送信完了！Google口コミページを開きました。口コミ内容はクリップボードにコピー済みです。');
        
        // 5. フォームをリセット
        resetForm();
        
    } catch (error) {
        console.error('送信エラー:', error);
        showToast('送信に失敗しました。もう一度お試しください。', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '口コミを投稿';
        updateButtonStates();
    }
}

// メール送信（ダミー実装）
async function sendEmail(emailData) {
    // 実際の実装では、EmailJS やバックエンドAPIを使用
    console.log('メール送信:', emailData);
    
    // ダミーの遅延
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 実際の実装例（EmailJS使用）:
    // return emailjs.send('service_id', 'template_id', emailData);
}

// クリップボードにコピー
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('クリップボードコピーエラー:', error);
        // フォールバック
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

// ボタン状態の更新
function updateButtonStates() {
    // AI生成ボタンの状態
    if (generateButton) generateButton.disabled = !canGenerateAI();
    
    // 送信ボタンの状態
    if (submitButton) submitButton.disabled = !canSubmitReview();
}

// AI生成可能かチェック
function canGenerateAI() {
    return state.rating > 0 || state.tags.length > 0;
}

// 送信可能かチェック
function canSubmitReview() {
    return state.comment.trim().length > 0;
}

// フォームリセット
function resetForm() {
    state.rating = 0;
    state.tags = [];
    state.comment = '';
    
    // UI更新
    updateStarDisplay();
    
    // タグボタンの選択解除
    tagGrid.querySelectorAll('.tag-button').forEach(button => {
        button.classList.remove('selected');
    });
    
    // コメントクリア
    commentTextarea.value = '';
    
    updateButtonStates();
}

// トースト表示
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateButtonStates();
});
