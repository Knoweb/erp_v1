package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.SupplierSummaryDto;
import com.example.GinumApps.dto.external.MiddeniyaSupplierDto;
import com.example.GinumApps.dto.external.SupplierResponseDto;
import com.example.GinumApps.enums.SupplierType;
import com.example.GinumApps.enums.TaxType;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.util.JwtUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierService {

    private final InventoryClient inventoryClient;
    private final CompanyRepository companyRepository;
    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;

    @Value("${inventory.url.middeniya:http://localhost:8082}")
    private String middeniyaInventoryUrl;

    @Value("${inventory.url.knoweb:http://localhost:8082}")
    private String knowebInventoryUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
            // Middeniya droplet endpoint: /inventory-api/api/suppliers/organization/{companyId}
            String url = baseUrl + "/inventory-api/api/suppliers/organization/" + companyId;
            log.debug("Fetching suppliers from tenant URL: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            String authorization = resolveAuthorizationHeader();
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            copyJwtClaimIfPresent(headers, authorization, "x-industry-type", "industryType");
            copyJwtClaimIfPresent(headers, authorization, "x-org-id", "orgId");
            copyJwtClaimIfPresent(headers, authorization, "x-tenant-id", "tenantId");

            // Always send the tenant organization id expected by the inventory service.
            headers.set("x-org-id", String.valueOf(companyId));

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            var response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse Middeniya format (with nested contactInfo) and convert to standard format
                List<MiddeniyaSupplierDto> middeniyaSuppliers = objectMapper.readValue(
                        response.getBody(),
                        new TypeReference<List<MiddeniyaSupplierDto>>() {}
                );

                return middeniyaSuppliers.stream()
                        .map(MiddeniyaSupplierDto::toSupplierResponseDto)
                        .collect(Collectors.toList());
            }

            return List.of();
        } catch (Exception e) {
            log.error("Error fetching suppliers from tenant URL {} for company {}: {}",
                    baseUrl, companyId, e.getMessage(), e);
            return List.of();
        }
    }

    private void copyHeaderIfPresent(HttpHeaders targetHeaders, String headerName) {
        String value = resolveRequestHeader(headerName);
        if (value != null && !value.isBlank()) {
            targetHeaders.set(headerName, value);
        }
    }

    private void copyJwtClaimIfPresent(HttpHeaders targetHeaders, String authorizationHeader, String headerName, String claimName) {
        String value = resolveJwtClaim(authorizationHeader, claimName);
        if (value != null && !value.isBlank()) {
            targetHeaders.set(headerName, value);
        }
    }

    private String resolveAuthorizationHeader() {
        return resolveRequestHeader(HttpHeaders.AUTHORIZATION);
    }

    private String resolveJwtClaim(String authorizationHeader, String claimName) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authorizationHeader.substring(7);
        try {
            if ("orgId".equals(claimName)) {
                Long orgId = jwtUtil.extractClaim(token, claims -> {
                    Object value = claims.get("orgId");
                    return value != null ? Long.valueOf(String.valueOf(value)) : null;
                });
                return orgId != null ? String.valueOf(orgId) : null;
            }

            return jwtUtil.extractClaim(token, claims -> {
                Object value = claims.get(claimName);
                return value != null ? String.valueOf(value) : null;
            });
        } catch (Exception e) {
            log.debug("Unable to resolve JWT claim {} from authorization header: {}", claimName, e.getMessage());
            return null;
        }
    }

    private String resolveRequestHeader(String headerName) {
        var requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof ServletRequestAttributes servletRequestAttributes) {
            HttpServletRequest request = servletRequestAttributes.getRequest();
            return request.getHeader(headerName);
        }
        return null;
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
