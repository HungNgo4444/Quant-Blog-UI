import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.SITE_URL}/auth/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác thực email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Chào mừng bạn đến với AdvancedBlog!</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${name}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại AdvancedBlog. Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn.</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Xác thực Email</a>
          </div>
          
          <p>Hoặc copy và dán link sau vào trình duyệt:</p>
          <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          
          <p><strong>Lưu ý:</strong> Link xác thực này sẽ hết hạn sau 24 giờ.</p>
          
          <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        </div>
        <div class="footer">
          <p>© 2024 AdvancedBlog. Tất cả quyền được bảo lưu.</p>
          <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Xác thực email cho tài khoản AdvancedBlog',
    html,
    text: `Xin chào ${name}! Vui lòng truy cập link sau để xác thực email: ${verificationUrl}`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.SITE_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Đặt lại mật khẩu</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${name}!</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại AdvancedBlog.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
          </div>
          
          <p>Hoặc copy và dán link sau vào trình duyệt:</p>
          <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Lưu ý bảo mật:</strong>
            <ul>
              <li>Link này sẽ hết hạn sau 1 giờ</li>
              <li>Chỉ sử dụng link này nếu bạn đã yêu cầu đặt lại mật khẩu</li>
              <li>Không chia sẻ link này với bất kỳ ai</li>
            </ul>
          </div>
          
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
        </div>
        <div class="footer">
          <p>© 2024 AdvancedBlog. Tất cả quyền được bảo lưu.</p>
          <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Đặt lại mật khẩu cho tài khoản AdvancedBlog',
    html,
    text: `Xin chào ${name}! Vui lòng truy cập link sau để đặt lại mật khẩu: ${resetUrl}`,
  });
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng đến với AdvancedBlog</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Chào mừng đến với AdvancedBlog!</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${name}!</h2>
          <p>Tài khoản của bạn đã được xác thực thành công! Chào mừng bạn đến với cộng đồng AdvancedBlog.</p>
          
          <h3>🚀 Bạn có thể làm gì với AdvancedBlog?</h3>
          
          <div class="feature">
            <h4>📝 Viết và chia sẻ bài viết</h4>
            <p>Sử dụng editor Markdown mạnh mẽ để tạo nội dung chất lượng cao</p>
          </div>
          
          <div class="feature">
            <h4>💬 Tương tác với cộng đồng</h4>
            <p>Bình luận, like và chia sẻ các bài viết bạn yêu thích</p>
          </div>
          
          <div class="feature">
            <h4>📊 Theo dõi hiệu suất</h4>
            <p>Xem thống kê lượt xem, like và tương tác với nội dung của bạn</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.SITE_URL}" class="button">Bắt đầu khám phá</a>
          </div>
          
          <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi!</p>
        </div>
        <div class="footer">
          <p>© 2024 AdvancedBlog. Tất cả quyền được bảo lưu.</p>
          <p>Theo dõi chúng tôi trên mạng xã hội để cập nhật tin tức mới nhất!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Chào mừng đến với AdvancedBlog! 🎉',
    html,
    text: `Xin chào ${name}! Chào mừng bạn đến với AdvancedBlog. Hãy bắt đầu khám phá tại ${process.env.SITE_URL}`,
  });
}; 