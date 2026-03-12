package com.example.GinumApps.service;

import com.example.GinumApps.dto.AppUserRequestDto;
import com.example.GinumApps.model.AppUser;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Employee;
import com.example.GinumApps.repository.AppUserRepository;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.EmployeeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AppUser createUser(@PathVariable Integer companyId, AppUserRequestDto request) {

        // Check if company exists
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // 1. Check if employee exists in the company
        Employee employee = employeeRepository.findByEmailAndCompanyCompanyId(
                request.getEmail(),
                companyId).orElseThrow(
                        () -> new RuntimeException(
                                "Employee not found in the specified company"));

        // 2. Check if email is already registered as a user
        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered as a user");
        }

        AppUser newUser = new AppUser();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole(request.getRole());
        newUser.setCompany(company);

        return appUserRepository.save(newUser);
    }

    public List<AppUser> getUsersByCompany(Integer companyId) {
        return appUserRepository.findAllByCompanyCompanyId(companyId);
    }

    @Transactional
    public AppUser updateUser(Integer companyId, Integer userId, com.example.GinumApps.dto.AppUserUpdateDto request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized: User does not belong to this company");
        }

        user.setRole(request.getRole());
        return appUserRepository.save(user);
    }

    @Transactional
    public void deleteUser(Integer companyId, Integer userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized: User does not belong to this company");
        }

        appUserRepository.delete(user);
    }
}