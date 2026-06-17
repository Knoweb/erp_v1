package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import com.example.GinumApps.dto.external.InventoryProductResponseDto;
import com.example.GinumApps.model.Customer;
import com.example.GinumApps.repository.CustomerRepository;
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
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalInventoryIntegrationService {

    private final InventoryClient inventoryClient;
    private final ObjectMapper objectMapper;
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final CustomerRepository customerRepository;

    @Value("${inventory.url.middeniya:http://178.128.221.122:3002}")
    private String middeniyaInventoryUrl;

    @Value("${order.url.knoweb:http://localhost:8083}")
    private String knowebOrderUrl;

    @Value("${product.url.knoweb:http://localhost:8092}")
    private String knowebProductUrl;

    public List<InventoryPoResponseDto> getApprovedPurchaseOrdersBySupplierId(Long supplierId) {
        try {
            log.info("Fetching approved purchase orders for supplierId: {}", supplierId);

            if (isMiddeniyaTenant()) {
                return fetchFromMiddeniyaDroplet(supplierId);
            }

            return fetchFromKnowebOrderService(supplierId);
        } catch (Exception e) {
            log.error("Error fetching approved purchase orders for supplierId: {}", supplierId, e);
            return new ArrayList<>();
        }
    }

    private boolean isMiddeniyaTenant() {
        return "16".equals(SecurityContextUtil.getCurrentOrganizationId());
    }

    private List<InventoryPoResponseDto> fetchFromKnowebOrderService(Long supplierId) {
        try {
            String url = knowebOrderUrl + "/api/orders/purchase";
            log.info("Routing PO fetch for org {} to local order service: {}", SecurityContextUtil.getCurrentOrganizationId(), url);

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
                log.warn("Knoweb PO fetch returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            List<InventoryPoResponseDto> purchaseOrders = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<InventoryPoResponseDto>>() {}
            );

            List<InventoryPoResponseDto> filtered = purchaseOrders.stream()
                    .filter(Objects::nonNull)
                    .peek(po -> log.debug("Knoweb PO: id={}, supplierId={}, status={}",
                            po.getId(), po.getSupplierId(), po.getStatus()))
                    .filter(po -> supplierId.equals(po.getSupplierId()))
                    .collect(Collectors.toList());

            log.info("Knoweb order service returned {} purchase orders for supplierId {}",
                    filtered.size(), supplierId);
            return filtered;
        } catch (Exception e) {
            log.error("Error fetching Knoweb purchase orders for supplierId {}: {}", supplierId, e.getMessage(), e);
            return new ArrayList<>();
        }
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
                    .collect(Collectors.toList());

            log.info("Middeniya droplet returned {} purchase orders for supplierId {}",
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

    public Object fetchProductById(String id) {
        try {
            if (isMiddeniyaTenant()) {
                String url = middeniyaInventoryUrl + "/inventory-api/api/products/" + id;
                log.info("Fetching Middeniya product from: {}", url);

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
                    log.warn("Middeniya product fetch returned status {} with empty body", response.getStatusCode());
                    return null;
                }

                return objectMapper.readValue(response.getBody(), Object.class);
            } else {
                String url = knowebProductUrl + "/api/products/" + id;
                log.info("Fetching Knoweb product from: {}", url);

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

                try {
                    ResponseEntity<String> response = restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            new HttpEntity<>(headers),
                            String.class
                    );

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isBlank()) {
                        return objectMapper.readValue(response.getBody(), Object.class);
                    }
                } catch (Exception e) {
                    log.warn("Failed fetching from knoweb product-service, trying fallback feign client: {}", e.getMessage());
                }
            }

            // Default: use inventory client
            return inventoryClient.getItemById(id);
        } catch (Exception e) {
            log.error("Error fetching external product by id {}: {}", id, e.getMessage(), e);
            return null;
        }
    }

    public List<InventoryProductResponseDto> getProductsByOrganization(Long orgId) {
        try {
            if (isMiddeniyaTenant()) {
                return fetchProductsFromMiddeniya(orgId);
            }
            return fetchProductsFromKnoweb(orgId);
        } catch (Exception e) {
            log.error("Error fetching products for orgId {}: {}", orgId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private List<InventoryProductResponseDto> fetchProductsFromMiddeniya(Long orgId) {
        try {
            String url = middeniyaInventoryUrl + "/inventory-api/api/products/organization/" + orgId;
            log.info("Fetching Middeniya products from: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String authorization = resolveRequestHeader("Authorization");
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            String currentOrgId = SecurityContextUtil.getCurrentOrganizationId();
            if (currentOrgId != null && !currentOrgId.isBlank()) {
                headers.set("X-Org-ID", currentOrgId);
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
                log.warn("Middeniya product list returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            List<Object> rawProducts = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<Object>>() {}
            );

            return rawProducts.stream()
                    .filter(Objects::nonNull)
                    .map(product -> objectMapper.convertValue(product, InventoryProductResponseDto.class))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching Middeniya products for orgId {}: {}", orgId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private List<InventoryProductResponseDto> fetchProductsFromKnoweb(Long orgId) {
        try {
            String url = knowebProductUrl + "/api/products/organization/" + orgId;
            log.info("Fetching Knoweb products from: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String authorization = resolveRequestHeader("Authorization");
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            String currentOrgId = SecurityContextUtil.getCurrentOrganizationId();
            if (currentOrgId != null && !currentOrgId.isBlank()) {
                headers.set("X-Org-ID", currentOrgId);
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
                log.warn("Knoweb product list returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            List<Object> rawProducts = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<Object>>() {}
            );

            return rawProducts.stream()
                    .filter(Objects::nonNull)
                    .map(product -> objectMapper.convertValue(product, InventoryProductResponseDto.class))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching Knoweb products for orgId {}: {}", orgId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getCompletedSalesOrdersByOrganization(Long orgId) {
        try {
            if (isMiddeniyaTenant()) {
                return fetchSalesOrdersFromMiddeniya(orgId);
            }
            return fetchSalesOrdersFromKnoweb(orgId);
        } catch (Exception e) {
            log.error("Error fetching completed sales orders for orgId {}: {}", orgId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private List<Map<String, Object>> fetchSalesOrdersFromMiddeniya(Long orgId) {
        try {
            String url = middeniyaInventoryUrl + "/inventory-api/api/orders/sales";
            log.info("Fetching completed sales orders from Middeniya: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String authorization = resolveRequestHeader("Authorization");
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            String currentOrgId = SecurityContextUtil.getCurrentOrganizationId();
            if (currentOrgId != null && !currentOrgId.isBlank()) {
                headers.set("X-Org-ID", currentOrgId);
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
                log.warn("Middeniya sales order list returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            List<Map<String, Object>> rawOrders = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            return rawOrders.stream()
                    .filter(Objects::nonNull)
                    .filter(order -> {
                        Object status = order.get("status");
                        return status != null && "COMPLETED".equalsIgnoreCase(String.valueOf(status));
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching completed sales orders from Middeniya for orgId {}: {}", orgId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private List<Map<String, Object>> fetchSalesOrdersFromKnoweb(Long orgId) {
        try {
            String url = knowebOrderUrl + "/api/orders/sales";
            log.info("Fetching completed sales orders from Knoweb: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String authorization = resolveRequestHeader("Authorization");
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            String currentOrgId = SecurityContextUtil.getCurrentOrganizationId();
            if (currentOrgId != null && !currentOrgId.isBlank()) {
                headers.set("X-Org-ID", currentOrgId);
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
                log.warn("Knoweb sales order list returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            List<Map<String, Object>> rawOrders = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            return rawOrders.stream()
                    .filter(Objects::nonNull)
                    .filter(order -> {
                        Object status = order.get("status");
                        return status != null && "COMPLETED".equalsIgnoreCase(String.valueOf(String.valueOf(status)));
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching completed sales orders from Knoweb for orgId {}: {}", orgId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getSalesOrdersByCustomerId(Long customerId) {
        try {
            log.info("Fetching sales orders for customerId: {}", customerId);

            String customerName = customerRepository.findById(customerId)
                    .map(Customer::getName)
                    .orElse(null);

            if (customerName == null || customerName.isBlank()) {
                log.warn("Customer not found or has blank name for ID: {}", customerId);
                return new ArrayList<>();
            }

            String targetNameLower = customerName.trim().toLowerCase();
            log.info("Filtering sales orders for customer name: '{}'", customerName);

            List<Map<String, Object>> allOrders;
            if (isMiddeniyaTenant()) {
                allOrders = fetchAllSalesOrdersFromMiddeniya();
            } else {
                allOrders = fetchAllSalesOrdersFromKnoweb();
            }

            log.info("Total sales orders fetched from inventory: {}", allOrders != null ? allOrders.size() : "null");
            if (allOrders != null && !allOrders.isEmpty()) {
                Map<String, Object> firstOrder = allOrders.get(0);
                log.info("First order keys: {}, customerName: {}, customer_name: {}", 
                         firstOrder.keySet(), firstOrder.get("customerName"), firstOrder.get("customer_name"));
            }

            if (allOrders == null) {
                return new ArrayList<>();
            }

            List<Map<String, Object>> filtered = allOrders.stream()
                    .filter(Objects::nonNull)
                    .filter(order -> {
                        Object orderCustNameObj = order.get("customerName");
                        if (orderCustNameObj == null) {
                            orderCustNameObj = order.get("customer_name");
                        }
                        if (orderCustNameObj == null) {
                            return false;
                        }
                        String orderCustName = String.valueOf(orderCustNameObj).trim().toLowerCase();
                        return orderCustName.equals(targetNameLower) || 
                               orderCustName.contains(targetNameLower) || 
                               targetNameLower.contains(orderCustName);
                    })
                    .collect(Collectors.toList());

            log.info("Found {} matching sales orders for customer '{}'", filtered.size(), customerName);
            return filtered;
        } catch (Exception e) {
            log.error("Error fetching sales orders for customerId {}: {}", customerId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private List<Map<String, Object>> fetchAllSalesOrdersFromMiddeniya() {
        try {
            String url = middeniyaInventoryUrl + "/inventory-api/api/orders/sales";
            log.info("Fetching all sales orders from Middeniya: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String authorization = resolveRequestHeader("Authorization");
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            String currentOrgId = SecurityContextUtil.getCurrentOrganizationId();
            if (currentOrgId != null && !currentOrgId.isBlank()) {
                headers.set("X-Org-ID", currentOrgId);
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
                log.warn("Middeniya sales order list returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            return objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );
        } catch (Exception e) {
            log.error("Error fetching all sales orders from Middeniya: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    private List<Map<String, Object>> fetchAllSalesOrdersFromKnoweb() {
        try {
            String url = knowebOrderUrl + "/api/orders/sales";
            log.info("Fetching all sales orders from Knoweb: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String authorization = resolveRequestHeader("Authorization");
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }

            String currentOrgId = SecurityContextUtil.getCurrentOrganizationId();
            if (currentOrgId != null && !currentOrgId.isBlank()) {
                headers.set("X-Org-ID", currentOrgId);
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
                log.warn("Knoweb sales order list returned status {} with empty body", response.getStatusCode());
                return new ArrayList<>();
            }

            return objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );
        } catch (Exception e) {
            log.error("Error fetching all sales orders from Knoweb: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
}