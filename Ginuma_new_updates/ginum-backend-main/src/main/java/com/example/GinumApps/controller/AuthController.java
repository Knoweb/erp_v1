package com.example.GinumApps.controller;

import com.example.GinumApps.dto.AuthRequest;
import com.example.GinumApps.dto.LoginResponse;
import com.example.GinumApps.model.Admin;
import com.example.GinumApps.model.AppUser;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.repository.AdminRepository;
import com.example.GinumApps.repository.AppUserRepository;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Base64;

// AuthController.java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AdminRepository adminRepository;
    private final CompanyRepository companyRepository;
    private final AppUserRepository userRepository;

    // Removed @CrossOrigin - Gateway handles CORS
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Extract role from authorities
            String role = authentication.getAuthorities().iterator().next().getAuthority();

            // ===== COMPANY STATUS CHECK =====
            // Only ROLE_COMPANY accounts are subject to active/inactive restrictions.
            // SUPER_ADMIN and APP_USER accounts bypass this check.
            if ("ROLE_COMPANY".equals(role)) {
                Company company = companyRepository.findByEmail(authRequest.getEmail()).orElse(null);
                if (company == null || company.getStatus() == null || !company.getStatus()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                            "Your account is inactive. Please contact the admin.");
                }
            }

            String token = jwtUtil.generateToken(userDetails.getUsername(), role);
            return ResponseEntity.ok(buildLoginResponse(userDetails.getUsername(), role, token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    private LoginResponse buildLoginResponse(String email, String role, String token) {
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRole(role);

        switch (role) {
            case "ROLE_SUPER_ADMIN":
                Admin admin = adminRepository.findByEmail(email).get();
                response.setUserId(admin.getId());
                break;
            case "ROLE_COMPANY":
                Company company = companyRepository.findByEmail(email).get();
                response.setCompanyId(company.getCompanyId());
                // Convert company logo byte[] to base64 string
                if (company.getCompanyLogo() != null && company.getCompanyLogo().length > 0) {
                    String base64Logo = Base64.getEncoder().encodeToString(company.getCompanyLogo());
                    response.setCompanyLogo("data:image/jpeg;base64," + base64Logo);
                }
                break;
            case "ROLE_APP_USER":
                AppUser appUser = userRepository.findByEmail(email).get();
                response.setUserId(appUser.getId());
                response.setCompanyId(appUser.getCompany().getCompanyId());
                // Convert company logo byte[] to base64 string
                if (appUser.getCompany().getCompanyLogo() != null && appUser.getCompany().getCompanyLogo().length > 0) {
                    String base64Logo = Base64.getEncoder().encodeToString(appUser.getCompany().getCompanyLogo());
                    response.setCompanyLogo("data:image/jpeg;base64," + base64Logo);
                }
                break;
        }
        return response;
    }
}