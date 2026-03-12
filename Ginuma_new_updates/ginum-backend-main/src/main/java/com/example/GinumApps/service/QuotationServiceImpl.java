package com.example.GinumApps.service;

import com.example.GinumApps.dto.QuotationLineItemDto;
import com.example.GinumApps.dto.QuotationRequestDto;
import com.example.GinumApps.dto.QuotationResponseDto;
import com.example.GinumApps.enums.QuotationStatus;
import com.example.GinumApps.model.AppNotification;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Customer;
import com.example.GinumApps.model.Quotation;
import com.example.GinumApps.model.QuotationLineItem;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.CustomerRepository;
import com.example.GinumApps.repository.QuotationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationServiceImpl implements QuotationService {
    
    private final QuotationRepository quotationRepository;
    private final CompanyRepository companyRepository;
    private final CustomerRepository customerRepository;
    private final AppNotificationService notificationService;

    @Override
    @Transactional
    public QuotationResponseDto createQuotation(Integer companyId, QuotationRequestDto requestDto) {
        // Validate company
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Validate customer
        Customer customer = customerRepository.findById(requestDto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!customer.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Customer does not belong to this company");
        }

        // Create quotation
        Quotation quotation = new Quotation();
        quotation.setCompany(company);
        quotation.setCustomer(customer);
        quotation.setIssueDate(requestDto.getIssueDate());
        quotation.setExpiryDate(requestDto.getExpiryDate());
        quotation.setTaxPercent(requestDto.getTaxPercent());
        quotation.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : QuotationStatus.DRAFT);
        quotation.setNotes(requestDto.getNotes());
        quotation.setTermsAndConditions(requestDto.getTermsAndConditions());

        // Generate quotation number
        quotation.setQuotationNumber(generateQuotationNumber(companyId));

        // Add line items
        for (QuotationLineItemDto itemDto : requestDto.getLineItems()) {
            QuotationLineItem lineItem = new QuotationLineItem();
            lineItem.setQuotation(quotation);
            lineItem.setDescription(itemDto.getDescription());
            lineItem.setQuantity(itemDto.getQuantity());
            lineItem.setUnitPrice(itemDto.getUnitPrice());
            lineItem.setDiscountPercent(itemDto.getDiscountPercent());
            quotation.getLineItems().add(lineItem);
        }

        // Save quotation
        Quotation savedQuotation = quotationRepository.save(quotation);

        return toResponseDto(savedQuotation);
    }

    @Override
    @Transactional
    public QuotationResponseDto updateQuotation(Integer companyId, Long quotationId, QuotationRequestDto requestDto) {
        Quotation quotation = quotationRepository.findByIdAndCompany_CompanyId(quotationId, companyId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        // Validate customer if changed
        if (!quotation.getCustomer().getId().equals(requestDto.getCustomerId())) {
            Customer customer = customerRepository.findById(requestDto.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            if (!customer.getCompany().getCompanyId().equals(companyId)) {
                throw new RuntimeException("Customer does not belong to this company");
            }
            quotation.setCustomer(customer);
        }

        // Update quotation fields
        quotation.setIssueDate(requestDto.getIssueDate());
        quotation.setExpiryDate(requestDto.getExpiryDate());
        quotation.setTaxPercent(requestDto.getTaxPercent());
        quotation.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : quotation.getStatus());
        quotation.setNotes(requestDto.getNotes());
        quotation.setTermsAndConditions(requestDto.getTermsAndConditions());

        // Update line items
        quotation.getLineItems().clear();
        for (QuotationLineItemDto itemDto : requestDto.getLineItems()) {
            QuotationLineItem lineItem = new QuotationLineItem();
            lineItem.setQuotation(quotation);
            lineItem.setDescription(itemDto.getDescription());
            lineItem.setQuantity(itemDto.getQuantity());
            lineItem.setUnitPrice(itemDto.getUnitPrice());
            lineItem.setDiscountPercent(itemDto.getDiscountPercent());
            quotation.getLineItems().add(lineItem);
        }

        Quotation updatedQuotation = quotationRepository.save(quotation);
        return toResponseDto(updatedQuotation);
    }

    @Override
    @Transactional(readOnly = true)
    public QuotationResponseDto getQuotationById(Integer companyId, Long quotationId) {
        Quotation quotation = quotationRepository.findByIdAndCompany_CompanyId(quotationId, companyId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return toResponseDto(quotation);
    }

    @Override
    @Transactional(readOnly = true)
    public Quotation getQuotationEntityById(Integer companyId, Long quotationId) {
        return quotationRepository.findByIdAndCompany_CompanyId(quotationId, companyId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuotationResponseDto> getAllQuotations(Integer companyId) {
        return quotationRepository.findByCompany_CompanyId(companyId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuotationResponseDto> getQuotationsByStatus(Integer companyId, QuotationStatus status) {
        return quotationRepository.findByCompany_CompanyIdAndStatus(companyId, status).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuotationResponseDto updateQuotationStatus(Integer companyId, Long quotationId, QuotationStatus status) {
        Quotation quotation = quotationRepository.findByIdAndCompany_CompanyId(quotationId, companyId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        
        QuotationStatus oldStatus = quotation.getStatus();
        quotation.setStatus(status);
        Quotation updatedQuotation = quotationRepository.save(quotation);
        
        // Create notification for status changes
        if (status == QuotationStatus.ACCEPTED) {
            createNotification(companyId, 
                String.format("✅ Quotation %s has been accepted by customer %s!", 
                    quotation.getQuotationNumber(), 
                    quotation.getCustomer().getName()));
        } else if (status == QuotationStatus.REJECTED) {
            createNotification(companyId, 
                String.format("❌ Quotation %s has been rejected by customer %s.", 
                    quotation.getQuotationNumber(), 
                    quotation.getCustomer().getName()));
        } else if (status == QuotationStatus.SENT && oldStatus == QuotationStatus.DRAFT) {
            createNotification(companyId, 
                String.format("📧 Quotation %s has been sent to customer %s.", 
                    quotation.getQuotationNumber(), 
                    quotation.getCustomer().getName()));
        }
        
        return toResponseDto(updatedQuotation);
    }

    @Override
    @Transactional
    public void deleteQuotation(Integer companyId, Long quotationId) {
        Quotation quotation = quotationRepository.findByIdAndCompany_CompanyId(quotationId, companyId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        quotationRepository.delete(quotation);
    }

    // Helper methods
    private String generateQuotationNumber(Integer companyId) {
        String lastNumber = quotationRepository.findLastQuotationNumberByCompanyId(companyId);
        int year = LocalDate.now().getYear();
        int nextNumber = 1;

        if (lastNumber != null && lastNumber.startsWith("QT-" + year)) {
            String numberPart = lastNumber.substring(lastNumber.lastIndexOf('-') + 1);
            nextNumber = Integer.parseInt(numberPart) + 1;
        }

        return String.format("QT-%d-%04d", year, nextNumber);
    }

    private QuotationResponseDto toResponseDto(Quotation quotation) {
        QuotationResponseDto dto = new QuotationResponseDto();
        dto.setId(quotation.getId());
        dto.setQuotationNumber(quotation.getQuotationNumber());
        dto.setCustomerId(quotation.getCustomer().getId());
        dto.setCustomerName(quotation.getCustomer().getName());
        dto.setIssueDate(quotation.getIssueDate());
        dto.setExpiryDate(quotation.getExpiryDate());
        dto.setSubtotal(quotation.getSubtotal());
        dto.setTaxPercent(quotation.getTaxPercent());
        dto.setTaxAmount(quotation.getTaxAmount());
        dto.setTotal(quotation.getTotal());
        dto.setStatus(quotation.getStatus());
        dto.setNotes(quotation.getNotes());
        dto.setTermsAndConditions(quotation.getTermsAndConditions());

        List<QuotationLineItemDto> lineItemDtos = quotation.getLineItems().stream()
                .map(item -> {
                    QuotationLineItemDto itemDto = new QuotationLineItemDto();
                    itemDto.setId(item.getId());
                    itemDto.setDescription(item.getDescription());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setDiscountPercent(item.getDiscountPercent());
                    itemDto.setTotalPrice(item.getTotalPrice());
                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setLineItems(lineItemDtos);
        return dto;
    }
    
    private void createNotification(Integer companyId, String message) {
        AppNotification notification = AppNotification.builder()
                .companyId(companyId)
                .message(message)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationService.createNotification(companyId, 
            java.util.Map.of("message", message));
    }
}
