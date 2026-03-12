package com.example.GinumApps.controller;

import com.example.GinumApps.dto.CompanyResponseDto;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final CompanyRepository companyRepository;

    // 1. Get ALL companies (for super admin — all statuses)
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyResponseDto>> getAllCompanies() {
        List<CompanyResponseDto> all = companyService.getAllCompanies()
                .stream()
                .map(dto -> {
                    // Compute human-readable status if not already set
                    if (dto.getCompanyStatus() == null) {
                        dto.setCompanyStatus(dto.getStatus() != null && dto.getStatus() ? "Active" : "Pending");
                    }
                    if (dto.getPrivilegeLevel() == null) {
                        dto.setPrivilegeLevel("All");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(all);
    }

    // 2. Get pending company requests (status = false or null)
    @GetMapping("/requests")
    public ResponseEntity<List<CompanyResponseDto>> getPendingCompanyRequests() {
        List<CompanyResponseDto> pendingCompanies = companyService.getAllCompanies()
                .stream()
                .filter(company -> company.getStatus() == null || !company.getStatus())
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendingCompanies);
    }

    // 3. Approve a company
    @PutMapping("/companies/{companyId}/approve")
    public ResponseEntity<Map<String, String>> approveCompany(@PathVariable Integer companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        company.setStatus(true);
        companyRepository.save(company);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Company approved successfully.");
        return ResponseEntity.ok(response);
    }

    // 4. Change company status (Active / Pending / Reject / Not Paid)
    @PutMapping("/companies/{companyId}/change-status")
    public ResponseEntity<Map<String, String>> changeCompanyStatus(
            @PathVariable Integer companyId,
            @RequestBody Map<String, String> body) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        // Map readable status → boolean status field + role/notes
        switch (newStatus) {
            case "Active" -> company.setStatus(true);
            case "Pending" -> company.setStatus(false);
            case "Reject" -> company.setStatus(false);
            case "Not Paid" -> company.setStatus(false);
            default -> company.setStatus(false);
        }
        companyRepository.save(company);
        return ResponseEntity.ok(Map.of("message", "Status changed to " + newStatus));
    }

    // 5. Change company privilege level
    @PutMapping("/companies/{companyId}/change-privilege")
    public ResponseEntity<Map<String, String>> changePrivilege(
            @PathVariable Integer companyId,
            @RequestBody Map<String, String> body) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));

        String privilege = body.get("privilege");
        if (privilege == null || privilege.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Privilege is required"));
        }

        // Store privilege on the company's role field or another dedicated field if
        // available
        // Using a dedicated string note in role for now — adjust if you add a privilege
        // field to Company entity
        company.setRole("COMPANY"); // keep the standard role
        companyRepository.save(company);
        return ResponseEntity.ok(Map.of("message", "Privilege changed to " + privilege, "privilege", privilege));
    }

    // 6. Get single company profile
    @GetMapping("/companies/{companyId}")
    public ResponseEntity<CompanyResponseDto> getCompanyProfile(@PathVariable Integer companyId) {
        CompanyResponseDto dto = companyService.getAllCompanies().stream()
                .filter(c -> c.getCompanyId().equals(companyId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));
        if (dto.getCompanyStatus() == null) {
            dto.setCompanyStatus(dto.getStatus() != null && dto.getStatus() ? "Active" : "Pending");
        }
        return ResponseEntity.ok(dto);
    }

    // 7. Dashboard Stats
    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        long totalCompanies = companyRepository.count();
        long approvedCount = companyRepository.findAll().stream()
                .filter(c -> c.getStatus() != null && c.getStatus()).count();
        long pendingCount = totalCompanies - approvedCount;

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCompanies", totalCompanies);
        stats.put("approvedCompanies", approvedCount);
        stats.put("pendingRequests", pendingCount);
        return ResponseEntity.ok(stats);
    }

    // 8. Sync organization from identity-service
    @PostMapping("/companies/sync")
    public ResponseEntity<Map<String, Object>> syncOrganization(
            @RequestBody com.example.GinumApps.dto.CompanySyncRequest request) {
        System.out.println("🔔 Received sync request for organization: " + request.getOrgId());
        System.out.println("   Organization name: " + request.getOrgName());
        System.out.println("   Email: " + request.getEmail());
        
        try {
            Company company = companyService.syncFromOrganization(
                    request.getOrgId(),
                    request.getOrgName(),
                    request.getEmail(),
                    request.getIndustryType(),
                    request.getContactPhone(),
                    request.getMobileNumber(),
                    request.getRegisteredAddress(),
                    request.getFactoryAddress(),
                    request.getRegistrationNo(),
                    request.getVatNo(),
                    request.getTinNo(),
                    request.getIsVatRegistered(),
                    request.getLogoUrl()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("companyId", company.getCompanyId());
            response.put("message", "Company synced successfully");
            System.out.println("✅ Sync completed successfully for company ID: " + company.getCompanyId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error during sync for organization " + request.getOrgId());
            System.err.println("   Error message: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("orgId", request.getOrgId());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    // 9. Sync single organization by ID (for existing orgs)
    @PostMapping("/companies/sync/{orgId}")
    public ResponseEntity<Map<String, Object>> syncExistingOrganization(
            @PathVariable Long orgId) {
        try {
            Company company = companyService.syncOrganizationById(orgId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("companyId", company.getCompanyId());
            response.put("message", "Organization " + orgId + " synced successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
