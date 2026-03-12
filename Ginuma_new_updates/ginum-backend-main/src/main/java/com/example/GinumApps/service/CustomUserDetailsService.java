package com.example.GinumApps.service;

import com.example.GinumApps.model.Admin;
import com.example.GinumApps.model.AppUser;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.repository.AdminRepository;
import com.example.GinumApps.repository.AppUserRepository;
import com.example.GinumApps.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final CompanyRepository companyRepository;
    private final AppUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Check Admin
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent())
            return buildGenericUser(admin.get().getEmail(),
                    admin.get().getPassword(), admin.get().getRole());

        // Check Company
        Optional<Company> company = companyRepository.findByEmail(email);
        if (company.isPresent())
            return buildGenericUser(company.get().getEmail(),
                    company.get().getPassword(), company.get().getRole());

        // ✅ Return AppUser directly — it implements UserDetails
        Optional<AppUser> user = userRepository.findByEmail(email);
        if (user.isPresent())
            return user.get();

        throw new UsernameNotFoundException("User not found with email: " + email);
    }

    private UserDetails buildGenericUser(String email, String password, String role) {
        return User.builder()
                .username(email)
                .password(password)
                .roles(role.replace("ROLE_", ""))
                .build();
    }
}