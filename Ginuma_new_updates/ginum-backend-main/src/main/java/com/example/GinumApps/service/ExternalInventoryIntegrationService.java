package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import com.example.GinumApps.util.SecurityContextUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalInventoryIntegrationService {

    private final InventoryClient inventoryClient;
    private final ObjectMapper objectMapper;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @Value("${inventory.url.middeniya:http://178.128.221.122:3002}")
    private String middeniyaInventoryUrl;

    public List<InventoryPoResponseDto> getApprovedPurchaseOrdersBySupplierId(Long supplierId) {
        try {
            log.info("Fetching approved purchase orders for supplierId: {}", supplierId);

            if (isMiddeniyaTenant()) {
                return fetchFromMiddeniyaDroplet(supplierId);
            }

            List<InventoryPoResponseDto> purchaseOrders = inventoryClient.getPurchaseOrders();
            log.info("Successfully fetched {} purchase orders from inventory service", 
                    purchaseOrders != null ? purchaseOrders.size() : 0);
            
            if (purchaseOrders == null || purchaseOrders.isEmpty()) {
                log.warn("No purchase orders found from inventory service");
                return new ArrayList<>();
            }
            
            List<InventoryPoResponseDto> filtered = purchaseOrders.stream()
                    .filter(Objects::nonNull)
                    .peek(po -> log.debug("Processing PO: id={}, supplierId={}, status={}", 
                            po.getId(), po.getSupplierId(), po.getStatus()))
                    .filter(po -> supplierId.equals(po.getSupplierId()))
                    .filter(po -> "APPROVED".equalsIgnoreCase(po.getStatus()))
                    .collect(Collectors.toList());
            
            log.info("Filtered to {} approved purchase orders for supplierId: {}", 
                    filtered.size(), supplierId);
            return filtered;
            
        } catch (feign.FeignException e) {
            String body = null;
            try {
                body = e.contentUTF8();
            } catch (Exception ex) {
                // ignore
            }
            log.error("Feign error fetching purchase orders (status={}) message={} body={}", e.status(), e.getMessage(), body);
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error fetching approved purchase orders for supplierId: {}", supplierId, e);
            return new ArrayList<>();
        }
    }

    private boolean isMiddeniyaTenant() {
        return "16".equals(SecurityContextUtil.getCurrentOrganizationId());
    }

    private List<InventoryPoResponseDto> fetchFromMiddeniyaDroplet(Long supplierId) {
        try {
            String url = middeniyaInventoryUrl + "/inventory-api/api/orders/purchase";
            log.info("Routing PO fetch for org 16 to Middeniya droplet: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String authorization = resolveRequestHeader("Authorization");
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            String orgId = SecurityContextUtil.getCurrentOrganizationId();
            if (orgId != null && !orgId.isBlank()) {
                headers.set("X-Org-ID", orgId);
            }

            copyRequestHeaderIfPresent(headers, "X-Tenant-ID");
            copyRequestHeaderIfPresent(headers, "X-Industry-Type");

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().isBlank()) {
                log.warn("Middeniya PO fetch returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            List<InventoryPoResponseDto> purchaseOrders = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<InventoryPoResponseDto>>() {}
            );

            List<InventoryPoResponseDto> filtered = purchaseOrders.stream()
                    .filter(Objects::nonNull)
                    .peek(po -> log.debug("Middeniya PO: id={}, supplierId={}, status={}",
                            po.getId(), po.getSupplierId(), po.getStatus()))
                    .filter(po -> supplierId.equals(po.getSupplierId()))
                    .filter(po -> "APPROVED".equalsIgnoreCase(po.getStatus()))
                    .collect(Collectors.toList());

            log.info("Middeniya droplet returned {} approved purchase orders for supplierId {}",
                    filtered.size(), supplierId);
            return filtered;
        } catch (Exception e) {
            log.error("Error fetching Middeniya purchase orders for supplierId {}: {}", supplierId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private String resolveRequestHeader(String headerName) {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletRequestAttributes) {
            HttpServletRequest request = servletRequestAttributes.getRequest();
            return request.getHeader(headerName);
        }
        return null;
    }

    private void copyRequestHeaderIfPresent(HttpHeaders headers, String headerName) {
        String value = resolveRequestHeader(headerName);
        if (value != null && !value.isBlank()) {
            headers.set(headerName, value);
        }
    }
}