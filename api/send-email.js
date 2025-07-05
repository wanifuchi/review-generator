// Vercel Function for email sending
import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { to, subject, body } = req.body;

    // Validation
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check environment variables
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not found');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: to,
      from: process.env.FROM_EMAIL || 'noreply@toneya-review.vercel.app',
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang='ja'>
        <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <title>新しい口コミ投稿</title>
        </head>
        <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
          <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;'>
            <h1 style='color: white; text-align: center; margin: 0;'>新しい口コミ投稿</h1>
          </div>
          
          <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;'>
            <h2 style='color: #333; margin-top: 0;'>口コミ内容</h2>
            <div style='background: white; padding: 15px; border-radius: 5px; margin: 10px 0;'>
              <pre style='white-space: pre-wrap; font-family: inherit; margin: 0; line-height: 1.6;'>${body}</pre>
            </div>
          </div>
          
          <div style='text-align: center; margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;'>
            <p style='color: #1976d2; margin: 0; font-size: 14px;'>
              📧 このメールは口コミ生成ツールから自動送信されました
            </p>
            <p style='color: #666; margin: 5px 0 0 0; font-size: 12px;'>
              送信日時: ${new Date().toLocaleString('ja-JP')}
            </p>
          </div>
        </body>
        </html>
      `
    };

    const result = await sgMail.send(msg);
    console.log('SendGrid result:', result);

    res.status(200).json({
      success: true,
      message: 'メールが正常に送信されました',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.body
    });
    
    res.status(500).json({
      error: 'メール送信に失敗しました',
      details: error.message,
      code: error.code
    });
  }
}