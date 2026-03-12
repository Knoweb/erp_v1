package com.example.GinumApps.controller;

import com.example.GinumApps.model.Company;
import com.example.GinumApps.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyLogoController {

    private final CompanyRepository companyRepository;

    /**
     * Upload or update company logo for an existing company
     */
    @PostMapping(value = "/{companyId}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadCompanyLogo(
            @PathVariable Integer companyId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please select a file to upload"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.equals("image/jpeg") && 
                 !contentType.equals("image/png") && 
                 !contentType.equals("image/jpg"))) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only JPG, JPEG, and PNG files are allowed"));
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size must not exceed 5MB"));
            }

            // Find company
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));

            // Save logo as byte array
            company.setCompanyLogo(file.getBytes());
            companyRepository.save(company);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Company logo uploaded successfully");
            response.put("companyId", companyId);
            
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload logo: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete company logo
     */
    @DeleteMapping("/{companyId}/logo")
    public ResponseEntity<?> deleteCompanyLogo(@PathVariable Integer companyId) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));

            company.setCompanyLogo(null);
            companyRepository.save(company);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Company logo deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
