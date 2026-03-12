package com.example.GinumApps.service;

import com.example.GinumApps.dto.QuotationRequestDto;
import com.example.GinumApps.dto.QuotationResponseDto;
import com.example.GinumApps.enums.QuotationStatus;
import com.example.GinumApps.model.Quotation;

import java.util.List;

public interface QuotationService {
    QuotationResponseDto createQuotation(Integer companyId, QuotationRequestDto requestDto);
    
    QuotationResponseDto updateQuotation(Integer companyId, Long quotationId, QuotationRequestDto requestDto);
    
    QuotationResponseDto getQuotationById(Integer companyId, Long quotationId);
    
    Quotation getQuotationEntityById(Integer companyId, Long quotationId);
    
    List<QuotationResponseDto> getAllQuotations(Integer companyId);
    
    List<QuotationResponseDto> getQuotationsByStatus(Integer companyId, QuotationStatus status);
    
    QuotationResponseDto updateQuotationStatus(Integer companyId, Long quotationId, QuotationStatus status);
    
    void deleteQuotation(Integer companyId, Long quotationId);
}
