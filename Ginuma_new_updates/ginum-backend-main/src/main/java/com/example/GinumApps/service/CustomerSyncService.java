package com.example.GinumApps.service;

import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Customer;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.CustomerRepository;
import com.example.GinumApps.enums.CustomerType;
import com.example.GinumApps.enums.TaxType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerSyncService {

    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;
    private final RestTemplate restTemplate;

    private static final String MIDDENIYA_API_URL = "http://178.128.221.122:3002/inventory-api/api/customers/organization";

    /**
     * Sync customers from Middeniya to Ginuma for a specific organization
     */
    public Map<String, Object> syncCustomersFromMiddeniya(Long companyId, Long orgId, String token) {
        Map<String, Object> result = new HashMap<>();
        try {
            log.info("Starting customer sync from Middeniya for companyId: {}, orgId: {}", companyId, orgId);

            // Verify company exists
            Company company = companyRepository.findById(companyId.intValue())
                    .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));

            // Fetch customers from Middeniya
            List<Map<String, Object>> middeniyaCustomers = fetchMiddeniyaCustomers(orgId);
            log.info("Fetched {} customers from Middeniya", middeniyaCustomers.size());

            int created = 0;
            int updated = 0;
            List<String> errors = new ArrayList<>();

            // Transform and sync each customer
            for (Map<String, Object> middeniyaCustomer : middeniyaCustomers) {
                try {
                    Customer ginumaCustomer = transformAndSaveCustomer(middeniyaCustomer, company);
                    if (ginumaCustomer.getId() == null) {
                        created++;
                    } else {
                        updated++;
                    }
                } catch (Exception e) {
                    String error = "Failed to sync customer: " + e.getMessage();
                    log.error(error, e);
                    errors.add(error);
                }
            }

            result.put("status", "success");
            result.put("created", created);
            result.put("updated", updated);
            result.put("errors", errors);
            result.put("total", created + updated);
            log.info("Customer sync completed: created={}, updated={}, errors={}", created, updated, errors.size());

        } catch (Exception e) {
            log.error("Customer sync failed", e);
            result.put("status", "error");
            result.put("message", e.getMessage());
        }
        return result;
    }

    /**
     * Fetch customers from Middeniya API
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchMiddeniyaCustomers(Long orgId) {
        try {
            String url = MIDDENIYA_API_URL + "/" + orgId;
            log.debug("Calling Middeniya API: {}", url);

            Object response = restTemplate.getForObject(url, Object.class);

            if (response instanceof List) {
                return (List<Map<String, Object>>) response;
            } else if (response instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) response;
                if (map.containsKey("data")) {
                    Object data = map.get("data");
                    if (data instanceof List) {
                        return (List<Map<String, Object>>) data;
                    }
                }
            }
            log.warn("Unexpected response format from Middeniya API");
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to fetch customers from Middeniya", e);
            return new ArrayList<>();
        }
    }

    /**
     * Transform Middeniya customer data to Ginuma format and save
     */
    private Customer transformAndSaveCustomer(Map<String, Object> middeniyaData, Company company) {
        String customerName = (String) middeniyaData.getOrDefault("customerName", "");
        String vatNumber = (String) middeniyaData.getOrDefault("vatNumber", "");
        String phoneNumber = (String) middeniyaData.getOrDefault("phoneNumber", "");
        String address = (String) middeniyaData.getOrDefault("address", "");
        Map<String, Object> contactInfo = (Map<String, Object>) middeniyaData.get("contactInfo");

        // Extract additional info from contactInfo if available
        if (contactInfo == null) {
            contactInfo = new HashMap<>();
        }

        String email = (String) middeniyaData.getOrDefault("email",
                contactInfo.getOrDefault("email", ""));
        String billingAddress = (String) middeniyaData.getOrDefault("billingAddress", address);
        String deliveryAddress = (String) middeniyaData.getOrDefault("deliveryAddress", address);
        String nicNo = (String) middeniyaData.getOrDefault("nicNo",
                contactInfo.getOrDefault("nicNo", ""));

        // Check if customer already exists (by name and company)
        Optional<Customer> existingCustomer = customerRepository
                .findByNameAndCompany_CompanyId(customerName, company.getCompanyId());

        Customer customer;
        if (existingCustomer.isPresent()) {
            customer = existingCustomer.get();
            log.debug("Updating existing customer: {}", customerName);
        } else {
            customer = new Customer();
            customer.setCompany(company);
            log.debug("Creating new customer: {}", customerName);
        }

        // Map data
        customer.setName(customerName);
        customer.setPhoneNo(phoneNumber);
        customer.setEmail(email);
        customer.setVat(vatNumber);
        customer.setBillingAddress(billingAddress);
        customer.setDeliveryAddress(deliveryAddress);
        customer.setNicNo(nicNo);
        customer.setCustomerType(CustomerType.INDIVIDUAL); // Default
        customer.setTax(TaxType.INCLUSIVE); // Default

        return customerRepository.save(customer);
    }
}
