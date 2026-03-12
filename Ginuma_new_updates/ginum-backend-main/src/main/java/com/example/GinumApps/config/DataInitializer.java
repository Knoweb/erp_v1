package com.example.GinumApps.config;

import com.example.GinumApps.model.Admin;
import com.example.GinumApps.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // If no admin exists in the database, create a default super admin
        if (adminRepository.count() == 0) {
            Admin superAdmin = new Admin();
            superAdmin.setAdmin_name("Super Admin");
            superAdmin.setEmail("superadmin@ginuma.com");
            superAdmin.setPassword(passwordEncoder.encode("super123#"));
            superAdmin.setRole("SUPER_ADMIN");

            adminRepository.save(superAdmin);
            System.out.println("Default Super Admin created.");
        }
    }
}
