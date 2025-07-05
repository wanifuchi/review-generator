// Thanks Page JavaScript

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // URLパラメータから口コミテキストを取得
    const urlParams = new URLSearchParams(window.location.search);
    const reviewText = urlParams.get('review');
    const rating = urlParams.get('rating');
    
    // ローカルストレージからも取得を試行
    const storedReview = localStorage.getItem('lastGeneratedReview');
    const storedRating = localStorage.getItem('lastRating');
    
    // 口コミテキストを表示
    const reviewElement = document.getElementById('reviewText');
    if (reviewText) {
        reviewElement.textContent = decodeURIComponent(reviewText);
    } else if (storedReview) {
        reviewElement.textContent = storedReview;
    } else {
        reviewElement.textContent = '生成された口コミがここに表示されます';
    }
    
    // 星評価を設定
    const stars = document.querySelectorAll('.star');
    const ratingValue = rating || storedRating || 5;
    
    stars.forEach((star, index) => {
        if (index < ratingValue) {
            star.style.color = '#ffa502';
        } else {
            star.style.color = '#ddd';
        }
    });
    
    // アニメーション効果
    animateElements();
    
    // クリップボードに口コミをコピー（自動）
    const reviewToSave = reviewText || storedReview;
    if (reviewToSave) {
        copyToClipboard(reviewToSave);
    }
});

// 要素のアニメーション
function animateElements() {
    const speechBubble = document.querySelector('.speech-bubble');
    const phone = document.querySelector('.phone');
    const actionButton = document.querySelector('.action-button');
    
    // 段階的にアニメーション
    setTimeout(() => {
        speechBubble.style.animation = 'slideInDown 0.8s ease-out';
    }, 200);
    
    setTimeout(() => {
        phone.style.animation = 'slideInUp 0.8s ease-out';
    }, 600);
    
    setTimeout(() => {
        actionButton.style.animation = 'pulse 2s ease-in-out infinite';
    }, 1000);
}

// Google口コミページに遷移
function goToGoogle() {
    // ローカルストレージに保存
    const reviewText = document.getElementById('reviewText').textContent;
    if (reviewText && reviewText !== '生成された口コミがここに表示されます') {
        localStorage.setItem('savedReview', reviewText);
        localStorage.setItem('savedTimestamp', new Date().toISOString());
    }
    
    // クリップボードにコピー
    copyToClipboard(reviewText);
    
    // Google口コミページを開く（Place ID使用）
    const googleUrl = 'https://search.google.com/local/writereview?placeid=ChIJ9U9MIzVtUzURhoC_ot0YT20';
    window.open(googleUrl, '_blank');
    
    // 成功メッセージ
    showMessage('口コミをクリップボードにコピーしました！Google口コミページを開いています。');
}

// 戻るボタン
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// ホームボタン
function goHome() {
    window.location.href = 'index.html';
}

// クリップボードにコピー
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            console.log('✅ 口コミをクリップボードにコピーしました');
            return true;
        }
    } catch (error) {
        console.warn('Clipboard API失敗、フォールバックを試行:', error);
    }
    
    try {
        // フォールバック
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            console.log('✅ execCommandで口コミをコピーしました');
            return true;
        }
    } catch (error) {
        console.error('クリップボードコピー失敗:', error);
    }
    
    return false;
}

// メッセージ表示
function showMessage(message) {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 新しいメッセージを作成
    const messageDiv = document.createElement('div');
    messageDiv.className = 'temp-message';
    messageDiv.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // 3秒後に削除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutDown 0.3s ease-in';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 3000);
}

// CSS アニメーションを動的に追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(50px);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);