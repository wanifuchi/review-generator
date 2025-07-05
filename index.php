<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>とね屋 口コミ生成ツール</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- ヘッダー -->
        <header class="header">
            <img src="logo.png" alt="とね屋 口コミ生成ツール" class="logo">
        </header>

        <!-- メインコンテンツ -->
        <main class="main-content">
            <!-- ステップ1: 評価選択 -->
            <div class="step">
                <h2 class="step-title">STEP1: 評価を選択してください</h2>
                <div class="star-rating" id="starRating">
                    <span class="star" data-rating="1">★</span>
                    <span class="star" data-rating="2">★</span>
                    <span class="star" data-rating="3">★</span>
                    <span class="star" data-rating="4">★</span>
                    <span class="star" data-rating="5">★</span>
                </div>
            </div>

            <!-- ステップ2: タグ選択 -->
            <div class="step">
                <h2 class="step-title">STEP2: 該当するものを選択してください</h2>
                <div class="tag-grid" id="tagGrid">
                    <button class="tag-button" data-tag="斎場">斎場</button>
                    <button class="tag-button" data-tag="家族葬">家族葬</button>
                    <button class="tag-button" data-tag="海洋散骨">海洋散骨</button>
                    <button class="tag-button" data-tag="スタッフの対応">スタッフの対応</button>
                </div>
            </div>

            <!-- ステップ3: AI生成 -->
            <div class="step">
                <h2 class="step-title">STEP3: AI口コミ生成</h2>
                <button type="button" id="generateAI" class="generate-button" disabled>AI口コミ生成</button>
            </div>

            <!-- コメント入力・編集 -->
            <div class="step">
                <h2 class="step-title">口コミ内容（編集可能）</h2>
                <textarea id="comment" class="comment-textarea" placeholder="口コミ内容がここに表示されます。自由に編集できます。"></textarea>
            </div>

            <!-- 送信セクション -->
            <form id="reviewForm" method="POST" action="">
                <input type="hidden" id="hiddenRating" name="rating" value="">
                <input type="hidden" id="hiddenTags" name="tags" value="">
                <input type="hidden" id="hiddenComment" name="comment" value="">
                
                <div class="form-section">
                    <button type="submit" id="submitReview" class="submit-button" disabled>口コミを投稿</button>
                </div>
            </form>
        </main>

        <!-- トースト通知 -->
        <div id="toast" class="toast"></div>
    </div>

    <script>
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
        const reviewForm = document.getElementById('reviewForm');

        // 初期化
        document.addEventListener('DOMContentLoaded', function() {
            initializeEventListeners();
            updateButtonStates();
        });

        // イベントリスナーの初期化
        function initializeEventListeners() {
            if (starRating) starRating.addEventListener('click', handleStarClick);
            if (tagGrid) tagGrid.addEventListener('click', handleTagClick);
            if (generateButton) generateButton.addEventListener('click', handleGenerateAI);
            if (commentTextarea) commentTextarea.addEventListener('input', handleCommentChange);
            if (reviewForm) reviewForm.addEventListener('submit', handleFormSubmit);
        }

        // フォーム送信処理
        function handleFormSubmit(event) {
            event.preventDefault();
            
            if (!canSubmitReview()) return;
            
            // 隠しフィールドに値を設定
            document.getElementById('hiddenRating').value = state.rating;
            document.getElementById('hiddenTags').value = state.tags.join(', ');
            document.getElementById('hiddenComment').value = state.comment;
            
            // ローディング状態
            submitButton.disabled = true;
            submitButton.textContent = '投稿中...';
            
            // フォームを送信
            reviewForm.submit();
        }

        // 星評価のクリック処理
        function handleStarClick(event) {
            if (event.target.classList.contains('star')) {
                const rating = parseInt(event.target.dataset.rating);
                state.rating = rating;
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
                    state.tags = state.tags.filter(t => t !== tag);
                    button.classList.remove('selected');
                } else {
                    state.tags.push(tag);
                    button.classList.add('selected');
                }
                
                updateButtonStates();
            }
        }

        // AI生成ボタンのクリック処理
        async function handleGenerateAI() {
            if (!canGenerateAI()) return;
            
            generateButton.classList.add('loading');
            generateButton.disabled = true;
            generateButton.textContent = '生成中...';
            
            try {
                const review = generateReviewLocally(state.rating, state.tags);
                state.comment = review;
                commentTextarea.value = review;
                
                showToast('口コミが生成されました！');
            } catch (error) {
                console.error('AI生成エラー:', error);
                showToast('口コミの生成に失敗しました。もう一度お試しください。', 'error');
            } finally {
                generateButton.classList.remove('loading');
                generateButton.disabled = false;
                generateButton.textContent = 'AI口コミ生成';
                updateButtonStates();
            }
        }

        // ローカル口コミ生成
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
                specific_issue: ['説明が分かりにくい', '手続きに時間がかかる', '連絡の行き違い'],
                minor_concern: ['待ち時間が少し長かった', '説明がもう少し詳しければ良かった'],
                small_issue: ['進行のタイミング', '費用の説明'],
                positive_detail: ['事前に丁寧に説明', '細かい要望にも対応', '温かい声かけ'],
                staff_kindness: ['スタッフの方の優しい声かけ', '気遣いのある対応'],
                exceptional_service: ['想像以上に心のこもった対応を', '本当に丁寧な進行を'],
                outstanding_care: ['事前の準備から当日まで完璧な段取り', 'スタッフ皆さんの温かい配慮'],
                emotional_moment: ['最後のお別れの時', '式の進行中']
            };

            function randomChoice(array) {
                return array[Math.floor(Math.random() * array.length)];
            }

            const variables = {};
            Object.keys(variableOptions).forEach(key => {
                if (Array.isArray(variableOptions[key])) {
                    variables[key] = randomChoice(variableOptions[key]);
                } else if (typeof variableOptions[key] === 'object') {
                    const mainTag = tags[0] || 'default';
                    variables[key] = variableOptions[key][mainTag] || variableOptions[key]['default'];
                }
            });

            const templates = realExperiences[rating] || realExperiences[3];
            const selectedTemplate = randomChoice(templates);
            
            let review = selectedTemplate;
            Object.entries(variables).forEach(([key, value]) => {
                if (value) {
                    review = review.replace(new RegExp(`#{${key}}`, 'g'), value);
                }
            });

            return review.trim();
        }

        // コメント入力の処理
        function handleCommentChange(event) {
            state.comment = event.target.value;
            updateButtonStates();
        }

        // ボタン状態の更新
        function updateButtonStates() {
            if (generateButton) generateButton.disabled = !canGenerateAI();
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

        // トースト表示
        function showToast(message, type = 'success') {
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    </script>
</body>
</html>

<?php
// PHP処理：フォーム送信時
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once 'config.php';
    
    // XSERVER対応: PHPMailer読み込み
    if (file_exists('vendor/autoload.php')) {
        // Composer版
        require 'vendor/autoload.php';
    } elseif (file_exists('PHPMailer/src/PHPMailer.php')) {
        // 手動インストール版
        require_once 'PHPMailer/src/Exception.php';
        require_once 'PHPMailer/src/PHPMailer.php';
        require_once 'PHPMailer/src/SMTP.php';
    } else {
        // エラー：PHPMailerが見つからない
        die('❌ PHPMailerが見つかりません。XSERVER_QUICK_SETUP.md の手順を確認してください。');
    }
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\Exception;
    
    $rating = $_POST['rating'] ?? '';
    $tags = $_POST['tags'] ?? '';
    $comment = $_POST['comment'] ?? '';
    
    if ($rating && $comment) {
        try {
            $mail = new PHPMailer(true);
            
            // SMTP設定
            $mail->isSMTP();
            $mail->Host = MAIL_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = MAIL_USERNAME;
            $mail->Password = MAIL_PASSWORD;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = MAIL_PORT;
            $mail->CharSet = 'UTF-8';
            
            // 送信者・受信者設定
            $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
            $mail->addAddress(MAIL_TO_EMAIL);
            
            // メール内容
            $mail->isHTML(true);
            $mail->Subject = "新しい口コミ投稿 - {$rating}★";
            
            $htmlBody = "
            <h2>🎋 新しい口コミが投稿されました</h2>
            <div style='background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;'>
                <p><strong>⭐ 評価:</strong> {$rating}つ星</p>
                <p><strong>🏷️ タグ:</strong> {$tags}</p>
                <hr>
                <p><strong>💬 口コミ内容:</strong></p>
                <div style='background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;'>
                    " . nl2br(htmlspecialchars($comment)) . "
                </div>
            </div>
            <p><small>送信日時: " . date('Y年m月d日 H:i:s') . "</small></p>
            ";
            
            $mail->Body = $htmlBody;
            $mail->send();
            
            // 送信成功 - thanksページにリダイレクト
            header('Location: thanks.php?success=1&rating=' . urlencode($rating) . '&comment=' . urlencode($comment));
            exit;
            
        } catch (Exception $e) {
            error_log('メール送信エラー: ' . $e->getMessage());
            $error_message = 'メール送信に失敗しました。';
        }
    } else {
        $error_message = '必要な情報が不足しています。';
    }
}

// エラーがある場合の処理
if (isset($error_message)) {
    echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            showToast('{$error_message}', 'error');
        });
    </script>";
}
?>