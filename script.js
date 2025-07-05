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

// 大幅改良：人間らしい自然なローカル生成
function generateReviewLocally(rating, tags) {
    const realExperiences = {
        1: [
            '父の葬儀でお世話になりましたが、正直なところ期待していたサービスとは少し違いました。#{specific_issue}の件で戸惑うことが多く、もう少し丁寧な説明があれば良かったと思います。',
            '#{family_relation}の葬儀を依頼しましたが、#{service_area}について想像していたものと違う部分がありました。大切な時だけに、もう少し配慮していただけたら良かったです。'
        ],
        2: [
            '#{family_relation}の葬儀でお世話になりました。#{service_area}については基本的な対応はしていただけたのですが、#{minor_concern}という点で少し気になることがありました。全体的には可もなく不可もなくという印象です。',
            '家族の葬儀を#{service_area}でお願いしました。スタッフの方は親切でしたが、#{small_issue}の部分でもう少し配慮があれば良かったかなと思います。'
        ],
        3: [
            '#{family_relation}の葬儀でお世話になりました。#{service_area}については標準的な対応をしていただき、特に大きな問題もなく進めることができました。必要な手続きも滞りなく行っていただけました。',
            '家族葬を#{service_area}でお願いしました。想定していた通りのサービスで、安心してお任せできました。特別すごいというわけではありませんが、必要十分な対応をしていただけたと思います。'
        ],
        4: [
            '#{family_relation}の葬儀で大変お世話になりました。#{service_area}では、#{positive_detail}していただき、家族一同安心してお任せできました。思っていた以上に丁寧な対応で、本当に感謝しています。',
            '大切な#{family_relation}の葬儀を#{service_area}でお願いしました。#{staff_kindness}など、細かいところまで気遣っていただき、悲しみの中でも心が温まりました。またお世話になることがあればお願いしたいです。'
        ],
        5: [
            '#{family_relation}の葬儀で本当にお世話になりました。#{service_area}では#{exceptional_service}していただき、家族全員が心から感動しました。#{emotional_moment}の場面では涙が出そうになりました。心から感謝しており、必ず知人にもおすすめします。',
            '大切な#{family_relation}を見送る葬儀を#{service_area}でお願いしました。#{outstanding_care}など、想像以上の心配りをしていただき、故人も安心して旅立てたと思います。本当にありがとうございました。'
        ]
    };

    const variableOptions = {
        family_relation: ['父', '母', '祖父', '祖母'],
        service_area: {
            '斎場': '斎場での式',
            '家族葬': '家族葬',
            '海洋散骨': '海洋散骨',
            'スタッフの対応': 'サービス全般',
            'default': 'サービス全般'
        },
        // 1-2星用（ネガティブ）
        specific_issue: ['説明が分かりにくい', '手続きに時間がかかる', '連絡の行き違い'],
        minor_concern: ['待ち時間が少し長かった', '説明がもう少し詳しければ良かった'],
        small_issue: ['進行のタイミング', '費用の説明'],
        // 4-5星用（ポジティブ）
        positive_detail: ['事前に丁寧に説明', '細かい要望にも対応', '温かい声かけ'],
        staff_kindness: ['スタッフの方の優しい声かけ', '気遣いのある対応'],
        exceptional_service: ['想像以上に心のこもった対応を', '本当に丁寧な進行を'],
        outstanding_care: ['事前の準備から当日まで完璧な段取り', 'スタッフ皆さんの温かい配慮'],
        emotional_moment: ['最後のお別れの時', '式の進行中']
    };

    // ランダム選択関数
    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // 変数を生成
    const variables = {};
    Object.keys(variableOptions).forEach(key => {
        if (Array.isArray(variableOptions[key])) {
            variables[key] = randomChoice(variableOptions[key]);
        } else if (typeof variableOptions[key] === 'object') {
            const mainTag = tags[0] || 'default';
            variables[key] = variableOptions[key][mainTag] || variableOptions[key]['default'];
        }
    });

    // テンプレート選択と生成
    const templates = realExperiences[rating] || realExperiences[3];
    const selectedTemplate = randomChoice(templates);
    
    // 変数置換
    let review = selectedTemplate;
    Object.entries(variables).forEach(([key, value]) => {
        if (value) {
            review = review.replace(new RegExp(`#{${key}}`, 'g'), value);
        }
    });

    return review.trim();
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

// Google口コミページを開く（Place ID使用）
function openGoogleReviewPage() {
    // 株式会社とね屋の正しいPlace IDを使用した直接的な口コミ投稿URL
    const reviewUrls = [
        // 1. 直接口コミ投稿ページ（株式会社とね屋のPlace ID使用） - 最も確実
        'https://search.google.com/local/writereview?placeid=ChIJ9U9MIzVtUzURhoC_ot0YT20',
        
        // 2. Google Maps での口コミ投稿（株式会社とね屋のPlace ID使用）
        'https://www.google.com/maps/place/?q=place_id:ChIJ9U9MIzVtUzURhoC_ot0YT20&action=write-review',
        
        // 3. 株式会社とね屋での検索（フォールバック）
        'https://www.google.com/search?q=%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%E3%81%A8%E3%81%AD%E5%B1%8B+%E3%82%AF%E3%83%81%E3%82%B3%E3%83%9F&hl=ja'
    ];
    
    // 最初のURLを開く（直接口コミ投稿ページ）
    const targetUrl = reviewUrls[0];
    
    try {
        // 新しいタブで開く
        const newWindow = window.open(targetUrl, '_blank');
        
        // ポップアップブロック対策
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // ポップアップがブロックされた場合の代替手段
            window.location.href = targetUrl;
        }
        
        console.log('株式会社とね屋のGoogle口コミ投稿ページを開きました:', targetUrl);
        
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
            to: 'info@toneya.co.jp',
            subject: `新しい口コミ - ${state.rating}★`,
            body: `評価: ${state.rating}つ星\nタグ: ${state.tags.join(', ')}\n\n口コミ内容:\n${state.comment}`
        });
        
        // 2. クリップボードにコピー
        const copySuccess = await copyToClipboard(state.comment);
        
        // 3. ローカルストレージに保存
        localStorage.setItem('lastGeneratedReview', state.comment);
        localStorage.setItem('lastRating', state.rating);
        
        // 4. Thanks ページに遷移
        window.location.href = `thanks.html?review=${encodeURIComponent(state.comment)}&rating=${state.rating}`;
        
        // 5. フォームをリセット（遷移前なので実質的には不要だが、念のため）
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

// メール送信（Vercel Functions使用）
async function sendEmail(emailData) {
    try {
        // Vercel Functions のエンドポイントを使用
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ メール送信成功:', data.message);
        return data;
        
    } catch (error) {
        console.error('❌ メール送信エラー:', error);
        
        // フォールバック: コンソールにメール内容を出力
        console.log('📧 メール内容（送信されませんでした）:');
        console.log('宛先:', emailData.to);
        console.log('件名:', emailData.subject);
        console.log('本文:', emailData.body);
        
        // エラーを投げずに続行（Thanks ページには遷移する）
        return { success: false, message: 'メール設定が未完了です' };
    }
}

// クリップボードにコピー（強化版）
async function copyToClipboard(text) {
    try {
        // 最新のClipboard APIを試行
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            console.log('✅ Clipboard API でコピー成功:', text.substring(0, 50) + '...');
            return true;
        }
    } catch (error) {
        console.warn('Clipboard API失敗、フォールバックを試行:', error);
    }
    
    try {
        // フォールバック: 従来の方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            console.log('✅ execCommand でコピー成功:', text.substring(0, 50) + '...');
            return true;
        }
    } catch (error) {
        console.error('フォールバックコピー失敗:', error);
    }
    
    console.error('❌ すべてのコピー方法が失敗');
    return false;
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
