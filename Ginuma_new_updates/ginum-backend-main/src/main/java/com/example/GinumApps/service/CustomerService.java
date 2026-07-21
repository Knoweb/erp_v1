package com.example.GinumApps.service;

import com.example.GinumApps.dto.CustomerSummaryDto;
import com.example.GinumApps.dto.external.CustomerResponseDto;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Customer;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.CustomerRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class CustomerService {

        private final CustomerRepository customerRepository;
        private final CompanyRepository companyRepository;
        private final RestTemplate restTemplate;

        @Value("${inventory.url.middeniya:http://localhost:8082}")
        private String middeniyaInventoryUrl;

        @Value("${customer.url.knoweb:http://localhost:8088}")
        private String knowebCustomerUrl;

        private final ObjectMapper objectMapper = new ObjectMapper();

        // Creation of Customer is disabled in this service; master data is owned by a separate microservice.

        public List<CustomerSummaryDto> getCustomersByCompanyId(Integer companyId) {
                companyRepository.findById(companyId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Company not found with id: " + companyId));

                List<CustomerResponseDto> externalCustomers;

                if (companyId == 16) {
                        log.info("Company ID {} is Middeniya - routing customers to Middeniya droplet: {}", companyId,
                                        middeniyaInventoryUrl);
                        externalCustomers = fetchFromTenantUrl(middeniyaInventoryUrl, companyId);
                } else {
                        log.info("Company ID {} routing customers to Knoweb customer service: {}", companyId, knowebCustomerUrl);
                        externalCustomers = fetchFromTenantUrl(knowebCustomerUrl, companyId);
                }

                if (!externalCustomers.isEmpty()) {
                        return externalCustomers.stream()
                                        .map(this::convertExternalToSummaryDto)
                                        .collect(Collectors.toList());
                }

                List<Customer> customers = customerRepository.findByCompany_CompanyId(companyId);
                return customers.stream().map(this::convertToSummaryDto).collect(Collectors.toList());
        }

        private List<CustomerResponseDto> fetchFromTenantUrl(String baseUrl, Integer companyId) {
                try {
                        String url = baseUrl;
                        if (companyId == 16) {
                                url += "/inventory-api/api/customers/organization/" + companyId;
                        } else {
                                url += "/api/customers/organization/" + companyId;
                        }
                        log.debug("Fetching customers from tenant URL: {}", url);

                        HttpHeaders headers = new HttpHeaders();
                        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

                        String authorization = resolveAuthorizationHeader();
                        if (authorization != null && !authorization.isBlank()) {
                                headers.set(HttpHeaders.AUTHORIZATION, authorization);
                        }
                        headers.set("x-org-id", String.valueOf(companyId));

                        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity,
                                        String.class);

                        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                                return objectMapper.readValue(response.getBody(),
                                                new TypeReference<List<CustomerResponseDto>>() {
                                                });
                        }

                        return List.of();
                } catch (Exception e) {
                        log.error("Error fetching customers from tenant URL {} for company {}: {}", baseUrl, companyId,
                                        e.getMessage(), e);
                        return List.of();
                }
        }

        private CustomerSummaryDto convertToSummaryDto(Customer customer) {
                return CustomerSummaryDto.builder()
                                .id(customer.getId())
                                .name(customer.getName())
                                .email(customer.getEmail())
                                .phoneNo(customer.getPhoneNo())
                                .billingAddress(customer.getBillingAddress())
                                .deliveryAddress(customer.getDeliveryAddress())
                                .customerType(customer.getCustomerType())
                                .tax(customer.getTax())
                                .nicNo(customer.getNicNo())
                                .tinNo(customer.getTinNo())
                                .vat(customer.getVat())
                                .swiftNo(customer.getSwiftNo())
                                .discountPercentage(customer.getDiscountPercentage())
                                .build();
        }

        private CustomerSummaryDto convertExternalToSummaryDto(CustomerResponseDto customer) {
                var contact = customer.getContactInfo();

                String name = customer.getCustomerName();
                if ((name == null || name.isBlank()) && contact != null) {
                        name = contact.containsKey("name") ? String.valueOf(contact.get("name")) : null;
                        if (name == null || name.isBlank()) {
                                name = contact.containsKey("customerName") ? String.valueOf(contact.get("customerName")) : null;
                        }
                }

                String phone = customer.getPhoneNumber();
                if ((phone == null || phone.isBlank()) && contact != null) {
                        phone = contact.containsKey("phoneNumber") ? String.valueOf(contact.get("phoneNumber")) : null;
                        if (phone == null || phone.isBlank()) {
                                phone = contact.containsKey("phone") ? String.valueOf(contact.get("phone")) : null;
                        }
                        if (phone == null || phone.isBlank()) {
                                phone = contact.containsKey("mobileNo") ? String.valueOf(contact.get("mobileNo")) : null;
                        }
                }

                String email = null;
                if (contact != null) {
                        email = extractFieldIgnoreCase(contact, "email");
                }

                Map<String, Object> additional = customer.getAdditionalProperties();

                String address = customer.getAddress();
                if (address == null || address.isBlank()) address = customer.getRegisteredAddress();
                if (address == null || address.isBlank()) address = customer.getBillingAddress();
                if (address == null || address.isBlank()) address = extractFieldIgnoreCase(contact, "address", "registeredaddress", "billingaddress");
                if (address == null || address.isBlank()) address = extractFieldIgnoreCase(additional, "address", "registeredaddress", "billingaddress");

                String vat = customer.getVatNumber();
                if (vat == null || vat.isBlank()) vat = extractFieldIgnoreCase(contact, "vatnumber", "vatno", "vat");
                if (vat == null || vat.isBlank()) vat = extractFieldIgnoreCase(additional, "vatnumber", "vatno", "vat");

                String tinNo = customer.getTinNo();
                if (tinNo == null || tinNo.isBlank()) tinNo = customer.getTin();
                if (tinNo == null || tinNo.isBlank()) tinNo = extractFieldIgnoreCase(contact, "tinno", "tin");
                if (tinNo == null || tinNo.isBlank()) tinNo = extractFieldIgnoreCase(additional, "tinno", "tin");

                String nicNo = customer.getNicNo();
                if (nicNo == null || nicNo.isBlank()) nicNo = customer.getNic();
                if (nicNo == null || nicNo.isBlank()) nicNo = customer.getIdentityNumber();
                if (nicNo == null || nicNo.isBlank()) nicNo = extractFieldIgnoreCase(contact, "nicno", "nic", "identitynumber", "identitynumber(nic)");
                if (nicNo == null || nicNo.isBlank()) nicNo = extractFieldIgnoreCase(additional, "nicno", "nic", "identitynumber", "identitynumber(nic)");

                Double discountPercentage = customer.getDiscountPercentage();
                if (discountPercentage == null && contact != null && contact.containsKey("discountPercentage") && contact.get("discountPercentage") != null) {
                        try {
                                discountPercentage = Double.valueOf(String.valueOf(contact.get("discountPercentage")));
                        } catch (Exception ignored) {}
                }
                if (discountPercentage == null && additional != null && additional.containsKey("discountPercentage") && additional.get("discountPercentage") != null) {
                        try {
                                discountPercentage = Double.valueOf(String.valueOf(additional.get("discountPercentage")));
                        } catch (Exception ignored) {}
                }

                return CustomerSummaryDto.builder()
                                .id(customer.getId())
                                .name(name)
                                .email(email)
                                .phoneNo(phone)
                                .billingAddress(address)
                                .deliveryAddress(address)
                                .vat(vat)
                                .tinNo(tinNo)
                                .nicNo(nicNo)
                                .discountPercentage(discountPercentage)
                                .build();
        }

        // Update and deletion of customers is disabled; customer master data is owned by another service.

        private String extractFieldIgnoreCase(Map<String, Object> map, String... possibleKeys) {
                if (map == null || map.isEmpty()) return null;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                        if (entry.getValue() == null) continue;
                        String key = entry.getKey().replaceAll("\\s+", "").toLowerCase();
                        for (String pk : possibleKeys) {
                                if (key.equals(pk.toLowerCase())) {
                                        String val = String.valueOf(entry.getValue());
                                        if (!val.isBlank()) return val;
                                }
                        }
                }
                return null;
        }

        public CustomerSummaryDto getCustomerById(Long customerId) {
                Customer customer = customerRepository.findById(customerId)
                                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));
                return convertToSummaryDto(customer);
        }

        private String resolveAuthorizationHeader() {
                var requestAttributes = RequestContextHolder.getRequestAttributes();
                if (requestAttributes instanceof ServletRequestAttributes servletRequestAttributes) {
                        HttpServletRequest request = servletRequestAttributes.getRequest();
                        return request.getHeader(HttpHeaders.AUTHORIZATION);
                }
                return null;
        }
}
