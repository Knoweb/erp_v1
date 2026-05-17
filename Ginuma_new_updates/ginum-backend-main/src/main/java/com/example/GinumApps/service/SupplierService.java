package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.SupplierSummaryDto;
import com.example.GinumApps.dto.external.SupplierResponseDto;
import com.example.GinumApps.enums.SupplierType;
import com.example.GinumApps.enums.TaxType;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierService {

    private final InventoryClient inventoryClient;
    private final CompanyRepository companyRepository;
    private final RestTemplate restTemplate;

    @Value("${inventory.url.middeniya:http://localhost:8082}")
    private String middeniyaInventoryUrl;

    @Value("${inventory.url.knoweb:http://localhost:8082}")
    private String knowebInventoryUrl;

    // Tenant-aware supplier fetching: Company ID 16 (Middeniya) routes to Middeniya droplet,
    // other companies route to Knoweb/Ginuma droplet
    public List<SupplierSummaryDto> getSuppliersByCompanyId(Integer companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        List<SupplierResponseDto> externalSuppliers;

        // Check if this is Middeniya (company_id = 16) to route to Middeniya droplet
        if (companyId == 16) {
            log.info("Company ID {} is Middeniya - routing to Middeniya droplet: {}", companyId, middeniyaInventoryUrl);
            externalSuppliers = fetchFromTenantUrl(middeniyaInventoryUrl, companyId);
        } else {
            log.info("Company ID {} routing to Knoweb droplet: {}", companyId, knowebInventoryUrl);
            // For other companies, use the default Feign client (Knoweb/Ginuma droplet)
            externalSuppliers = inventoryClient.getSuppliers(companyId);
        }

        return externalSuppliers.stream()
                .map(this::convertExternalToSummary)
                .collect(Collectors.toList());
    }

    // Fetch suppliers from a specific tenant URL using RestTemplate
    private List<SupplierResponseDto> fetchFromTenantUrl(String baseUrl, Integer companyId) {
        try {
            // Middeniya droplet endpoint: /suppliers (without /api/inventory prefix)
            String url = baseUrl + "/suppliers?companyId=" + companyId;
            log.debug("Fetching suppliers from tenant URL: {}", url);
            
            var response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<SupplierResponseDto>>() {}
            );

            return response.getBody() != null ? response.getBody() : List.of();
        } catch (Exception e) {
            log.error("Error fetching suppliers from tenant URL {} for company {}: {}",
                    baseUrl, companyId, e.getMessage());
            return List.of();
        }
    }

    private SupplierSummaryDto convertExternalToSummary(SupplierResponseDto s) {
        String name = s.getSupplierName() != null ? s.getSupplierName() : s.getName();
        String mobile = s.getMobileNo() != null ? s.getMobileNo() : s.getContactNumber();

        SupplierType supplierType = null;
        TaxType taxType = null;
        try {
            if (s.getSupplierType() != null) supplierType = SupplierType.valueOf(s.getSupplierType());
        } catch (Exception ignored) {
        }
        try {
            if (s.getTax() != null) taxType = TaxType.valueOf(s.getTax());
        } catch (Exception ignored) {
        }

        return SupplierSummaryDto.builder()
                .id(s.getId())
                .supplierName(name)
                .email(s.getEmail())
                .mobileNo(mobile)
                .address(s.getAddress())
                .supplierType(supplierType)
                .tax(taxType)
                .itemCategory(s.getItemCategory())
                .build();
    }

}