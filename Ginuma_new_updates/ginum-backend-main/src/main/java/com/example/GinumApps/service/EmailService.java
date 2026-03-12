package com.example.GinumApps.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send quotation PDF via email to customer
     */
    public void sendQuotationEmail(String toEmail, String customerName, String quotationNumber, 
                                   byte[] pdfBytes) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Quotation " + quotationNumber + " - Ginuma ERP");

        String emailBody = String.format("""
            Dear %s,
            
            Please find attached your quotation (%s).
            
            This quotation is valid until the expiry date mentioned in the document.
            
            If you have any questions or would like to proceed with this quotation, 
            please don't hesitate to contact us.
            
            Thank you for your business.
            
            Best regards,
            Ginuma ERP Team
            """, customerName, quotationNumber);

        helper.setText(emailBody);

        // Attach PDF
        helper.addAttachment(quotationNumber + ".pdf", new ByteArrayResource(pdfBytes));

        mailSender.send(message);
    }
}
