package com.example.GinumApps.service;

import com.example.GinumApps.model.AppNotification;
import com.example.GinumApps.repository.QuotationRepository;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.search.FlagTerm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailReaderService {

    @Value("${spring.mail.username}")
    private String emailUsername;

    @Value("${spring.mail.password}")
    private String emailPassword;

    @Value("${spring.mail.imaps.host}")
    private String imapHost;

    @Value("${spring.mail.imaps.port}")
    private int imapPort;

    private final AppNotificationService notificationService;
    private final QuotationRepository quotationRepository;

    /**
     * Check for email replies every 2 minutes
     */
    @Scheduled(fixedDelay = 120000, initialDelay = 60000)
    public void checkForEmailReplies() {
        try {
            log.info("Checking for email replies...");
            
            Properties properties = new Properties();
            properties.put("mail.store.protocol", "imaps");
            properties.put("mail.imaps.host", imapHost);
            properties.put("mail.imaps.port", imapPort);
            properties.put("mail.imaps.ssl.enable", "true");
            properties.put("mail.imaps.timeout", "10000");

            Session session = Session.getInstance(properties);
            Store store = session.getStore("imaps");
            store.connect(imapHost, emailUsername, emailPassword);

            // Open INBOX folder
            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);

            // Search for unread messages
            Message[] messages = inbox.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));

            log.info("Found {} unread messages", messages.length);

            for (Message message : messages) {
                try {
                    String subject = message.getSubject();
                    String from = message.getFrom()[0].toString();

                    // Check if this is a reply to a quotation email
                    String quotationNumber = extractQuotationNumber(subject);

                    if (quotationNumber != null) {
                        log.info("Found reply for quotation: {} from {}", quotationNumber, from);
                        
                        // Extract email content
                        String emailContent = extractEmailContent(message);
                        
                        // Get company ID from quotation
                        quotationRepository.findByQuotationNumber(quotationNumber)
                                .ifPresent(quotation -> {
                                    String customerName = quotation.getCustomer().getName();
                                    String customerEmail = quotation.getCustomer().getEmail();
                                    
                                    // Create notification with email content
                                    String notificationMessage = String.format(
                                        "📨 Customer %s replied to quotation %s:\n\n\"%s\"",
                                        customerName, quotationNumber, emailContent
                                    );
                                    
                                    notificationService.createNotification(
                                        quotation.getCompany().getCompanyId(),
                                        java.util.Map.of("message", notificationMessage)
                                    );
                                    
                                    log.info("Created notification for quotation reply: {}", quotationNumber);
                                });

                        // Mark as read
                        message.setFlag(Flags.Flag.SEEN, true);
                    }
                } catch (Exception e) {
                    log.error("Error processing message: {}", e.getMessage());
                }
            }

            inbox.close(false);
            store.close();

            log.info("Email check completed");

        } catch (Exception e) {
            log.error("Error checking emails: {}", e.getMessage(), e);
        }
    }

    /**
     * Extract quotation number from email subject
     * Looks for patterns like "Re: Quotation QT-2026-0001" or "QT-2026-0001"
     */
    private String extractQuotationNumber(String subject) {
        if (subject == null) {
            return null;
        }

        // Pattern to match QT-YYYY-NNNN format
        Pattern pattern = Pattern.compile("QT-\\d{4}-\\d{4}");
        Matcher matcher = pattern.matcher(subject);

        if (matcher.find()) {
            return matcher.group();
        }

        return null;
    }

    /**
     * Extract text content from email message
     * Handles both plain text and HTML emails
     */
    private String extractEmailContent(Message message) throws MessagingException, IOException {
        String content = getTextFromMessage(message);
        
        if (content == null || content.trim().isEmpty()) {
            return "[No message content]";
        }
        
        // Clean up the content
        content = content.trim();
        
        // Remove HTML tags if present
        content = content.replaceAll("<[^>]+>", "");
        
        // Remove excess whitespace
        content = content.replaceAll("\\s+", " ");
        
        // Truncate if too long (max 200 characters)
        if (content.length() > 200) {
            content = content.substring(0, 197) + "...";
        }
        
        return content;
    }

    /**
     * Recursively extract text from message parts
     */
    private String getTextFromMessage(Object content) throws MessagingException, IOException {
        if (content instanceof String) {
            return (String) content;
        }
        
        if (content instanceof Multipart) {
            Multipart multipart = (Multipart) content;
            StringBuilder result = new StringBuilder();
            
            for (int i = 0; i < multipart.getCount(); i++) {
                BodyPart bodyPart = multipart.getBodyPart(i);
                
                if (bodyPart.isMimeType("text/plain")) {
                    result.append(bodyPart.getContent().toString());
                    break; // Prefer plain text
                } else if (bodyPart.isMimeType("text/html")) {
                    if (result.length() == 0) {
                        result.append(bodyPart.getContent().toString());
                    }
                } else if (bodyPart.getContent() instanceof Multipart) {
                    result.append(getTextFromMessage(bodyPart.getContent()));
                }
            }
            
            return result.toString();
        }
        
        if (content instanceof Part) {
            Part part = (Part) content;
            if (part.isMimeType("text/plain")) {
                return part.getContent().toString();
            } else if (part.isMimeType("text/html")) {
                return part.getContent().toString();
            } else if (part.getContent() instanceof Multipart) {
                return getTextFromMessage(part.getContent());
            }
        }
        
        return "";
    }
}
