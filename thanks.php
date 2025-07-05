<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ありがとうございます - とね屋</title>
    <link rel="stylesheet" href="thanks-styles.css">
</head>
<body>
    <div class="container">
        <div class="background-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
            <div class="shape shape-4"></div>
            <div class="shape shape-5"></div>
        </div>
        
        <div class="content">
            <div class="thank-you-message">
                <div class="speech-bubble">
                    <h1>アンケートを回答いただき<br>ありがとうございます</h1>
                </div>
            </div>
            
            <div class="main-message">
                <p class="highlight-text">よろしければGoogleへの口コミをして</p>
                <p class="highlight-text">応援いただけるとスタッフ一同励みになります</p>
            </div>
            
            <div class="phone-mockup">
                <div class="phone">
                    <div class="phone-header">
                        <span class="close-btn">×</span>
                        <span class="phone-title">新着情報</span>
                    </div>
                    <div class="phone-content">
                        <div class="stars" id="starsDisplay">
                            <span class="star">★</span>
                            <span class="star">★</span>
                            <span class="star">★</span>
                            <span class="star">★</span>
                            <span class="star">★</span>
                        </div>
                        <div class="review-text" id="reviewText">
                            <?php 
                            $comment = $_GET['comment'] ?? '生成された口コミがここに表示されます';
                            echo htmlspecialchars($comment);
                            ?>
                        </div>
                        <div class="photo-upload">
                            <button class="upload-btn">📷 写真や動画を追加</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="action-button" onclick="goToGoogle()">
                アンケート回答をデバイスに保存してGO
            </button>
            
            <p class="note">※ アンケート回答はデバイスに保存されます</p>
            
            <div class="navigation-buttons">
                <button class="nav-btn back-btn" onclick="goBack()">戻る</button>
                <button class="nav-btn home-btn" onclick="goHome()">ホーム</button>
            </div>
        </div>
    </div>

    <script>
        // ページ読み込み時の初期化
        document.addEventListener('DOMContentLoaded', function() {
            // URL パラメータから評価を取得
            const urlParams = new URLSearchParams(window.location.search);
            const rating = urlParams.get('rating') || 5;
            
            // 星評価を設定
            const stars = document.querySelectorAll('.star');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.style.color = '#ffa502';
                } else {
                    star.style.color = '#ddd';
                }
            });
            
            // アニメーション効果
            animateElements();
            
            // 口コミ内容をクリップボードにコピー
            const reviewText = document.getElementById('reviewText').textContent;
            if (reviewText && reviewText !== '生成された口コミがここに表示されます') {
                copyToClipboard(reviewText);
            }
        });

        // 要素のアニメーション
        function animateElements() {
            const speechBubble = document.querySelector('.speech-bubble');
            const phone = document.querySelector('.phone');
            const actionButton = document.querySelector('.action-button');
            
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
            
            // Google Mapsで株式会社とね屋を検索
            const googleUrl = 'https://www.google.com/maps/search/%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%E3%81%A8%E3%81%AD%E5%B1%8B/';
            window.open(googleUrl, '_blank');
            
            // 成功メッセージ
            showMessage('口コミをクリップボードにコピーしました！Google口コミページを開いています。');
        }

        // 戻るボタン
        function goBack() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.php';
            }
        }

        // ホームボタン
        function goHome() {
            window.location.href = 'index.php';
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
            const existingMessage = document.querySelector('.temp-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
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
    </script>
</body>
</html>