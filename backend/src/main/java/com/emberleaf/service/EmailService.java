package com.emberleaf.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String name, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify your Chai & Leaf account");

            String verifyUrl = frontendUrl + "/verify-email?token=" + token;
            String html = """
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fdfaf6; padding: 40px 32px; border-radius: 12px; border: 1px solid #e8ddd0;">
                  <h2 style="color: #4a7c59; margin: 0 0 4px 0; font-size: 22px;">Chai &amp; Leaf</h2>
                  <p style="color: #888; margin: 0 0 24px 0; font-size: 13px;">Premium Indian Teas</p>
                  <p style="color: #444; font-size: 16px;">Hi %s,</p>
                  <p style="color: #444; font-size: 15px; line-height: 1.6;">
                    Thanks for signing up! Please verify your email address to activate your account.
                  </p>
                  <a href="%s"
                     style="display: inline-block; background: #4a7c59; color: #fff; text-decoration: none;
                            padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0 24px;">
                    Verify Email Address
                  </a>
                  <p style="color: #999; font-size: 13px; line-height: 1.5;">
                    This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
                  </p>
                </div>
                """.formatted(name, verifyUrl);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
            // Don't rethrow — user account is created, they can use resend
        }
    }
}
