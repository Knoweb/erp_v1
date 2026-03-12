package com.example.GinumApps.controller;

import com.example.GinumApps.dto.QuotationRequestDto;
import com.example.GinumApps.dto.QuotationResponseDto;
import com.example.GinumApps.enums.QuotationStatus;
import com.example.GinumApps.model.Quotation;
import com.example.GinumApps.service.AppNotificationService;
import com.example.GinumApps.service.EmailService;
import com.example.GinumApps.service.PdfGenerationService;
import com.example.GinumApps.service.QuotationService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/quotations")
@RequiredArgsConstructor
public class QuotationController {
    
    private final QuotationService quotationService;
    private final PdfGenerationService pdfGenerationService;
    private final EmailService emailService;
    private final AppNotificationService notificationService;

    @PostMapping
    public ResponseEntity<QuotationResponseDto> createQuotation(
            @PathVariable Integer companyId,
            @Valid @RequestBody QuotationRequestDto requestDto) {
        QuotationResponseDto response = quotationService.createQuotation(companyId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{quotationId}")
    public ResponseEntity<QuotationResponseDto> updateQuotation(
            @PathVariable Integer companyId,
            @PathVariable Long quotationId,
            @Valid @RequestBody QuotationRequestDto requestDto) {
        QuotationResponseDto response = quotationService.updateQuotation(companyId, quotationId, requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{quotationId}")
    public ResponseEntity<QuotationResponseDto> getQuotationById(
            @PathVariable Integer companyId,
            @PathVariable Long quotationId) {
        QuotationResponseDto response = quotationService.getQuotationById(companyId, quotationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<QuotationResponseDto>> getAllQuotations(
            @PathVariable Integer companyId) {
        List<QuotationResponseDto> quotations = quotationService.getAllQuotations(companyId);
        return ResponseEntity.ok(quotations);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<QuotationResponseDto>> getQuotationsByStatus(
            @PathVariable Integer companyId,
            @PathVariable QuotationStatus status) {
        List<QuotationResponseDto> quotations = quotationService.getQuotationsByStatus(companyId, status);
        return ResponseEntity.ok(quotations);
    }

    @PatchMapping("/{quotationId}/status")
    public ResponseEntity<QuotationResponseDto> updateQuotationStatus(
            @PathVariable Integer companyId,
            @PathVariable Long quotationId,
            @RequestParam QuotationStatus status) {
        QuotationResponseDto response = quotationService.updateQuotationStatus(companyId, quotationId, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{quotationId}")
    public ResponseEntity<Void> deleteQuotation(
            @PathVariable Integer companyId,
            @PathVariable Long quotationId) {
        quotationService.deleteQuotation(companyId, quotationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{quotationId}/pdf")
    public ResponseEntity<byte[]> downloadQuotationPdf(
            @PathVariable Integer companyId,
            @PathVariable Long quotationId) {
        // Get the quotation with all details
        Quotation quotation = quotationService.getQuotationEntityById(companyId, quotationId);
        
        // Generate PDF
        byte[] pdfBytes = pdfGenerationService.generateQuotationPdf(quotation);
        
        // Set headers for PDF download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", 
                quotation.getQuotationNumber() + ".pdf");
        headers.setContentLength(pdfBytes.length);
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/{quotationId}/send-email")
    public ResponseEntity<String> sendQuotationEmail(
            @PathVariable Integer companyId,
            @PathVariable Long quotationId) {
        try {
            // Get the quotation with all details
            Quotation quotation = quotationService.getQuotationEntityById(companyId, quotationId);
            
            // Generate PDF
            byte[] pdfBytes = pdfGenerationService.generateQuotationPdf(quotation);
            
            // Send email to customer
            String customerEmail = quotation.getCustomer().getEmail();
            String customerName = quotation.getCustomer().getName();
            String quotationNumber = quotation.getQuotationNumber();
            
            emailService.sendQuotationEmail(customerEmail, customerName, quotationNumber, pdfBytes);
            
            // Create notification
            notificationService.createNotification(companyId, 
                java.util.Map.of("message", 
                    String.format("📧 Quotation %s has been emailed to %s (%s)", 
                        quotationNumber, customerName, customerEmail)));
            
            return ResponseEntity.ok("Email sent successfully to " + customerEmail);
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send email: " + e.getMessage());
        }
    }
}
