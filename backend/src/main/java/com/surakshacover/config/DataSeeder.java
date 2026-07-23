package com.surakshacover.config;

import com.surakshacover.entity.*;
import com.surakshacover.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds demo admin/agent/customer accounts and sample data.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final PremiumPaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled) return;

        String hash = passwordEncoder.encode("Password@123");

        // 1. Setup your Gmail user correctly
        User amandeepUser = userRepository.findByEmail("amandeepkumar0806@gmail.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .name("Amandeep Kumar")
                .email("amandeepkumar0806@gmail.com")
                .password(hash)
                .role("customer")
                .phone("7368915965")
                .status("ACTIVE")
                .verified(true)
                .build())
        );

        // Ensure a Customer profile is linked to your User
        Customer amandeepProfile = customerRepository.findByUserId(amandeepUser.getId()).orElseGet(() -> 
            customerRepository.save(Customer.builder()
                .userId(amandeepUser.getId())
                .name("Amandeep Kumar")
                .email(amandeepUser.getEmail())
                .phone(amandeepUser.getPhone())
                .dob(LocalDate.of(1999, 4, 12))
                .address("Ludhiana, Punjab, India")
                .build())
        );

        // Add a test policy for you if you don't have one
        if (policyRepository.findByCustomerId(amandeepProfile.getId()).isEmpty()) {
            policyRepository.save(Policy.builder()
                .customerId(amandeepProfile.getId())
                .policyType("Life")
                .policyNumber("SC-LIFE-TEST")
                .premiumAmount(new BigDecimal("12000"))
                .sumAssured(new BigDecimal("1000000"))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .status("active")
                .build());
            log.info("Added test policy for Amandeep Kumar");
        }

        // 2. Setup standard Demo Accounts if they don't exist
        if (userRepository.count() > 3) return;

        User admin = userRepository.save(User.builder()
                .name("System Admin").email("admin@surakshacover.in").password(hash).role("admin").phone("9000000001").status("ACTIVE").verified(true).build());
        
        userRepository.save(User.builder()
                .name("Rhea Kapoor").email("agent@surakshacover.in").password(hash).role("agent").phone("9000000002").status("ACTIVE").verified(true).build());

        User demoUser = userRepository.save(User.builder()
                .name("Demo Customer").email("customer@surakshacover.in").password(hash).role("customer").phone("9000000004").status("ACTIVE").verified(true).build());

        Customer demoCustomer = customerRepository.save(Customer.builder()
                .userId(demoUser.getId())
                .name("Demo Customer")
                .dob(LocalDate.of(1995, 1, 1))
                .phone("9000000004")
                .email("customer@surakshacover.in")
                .createdBy(admin.getId())
                .build());

        policyRepository.save(Policy.builder()
                .customerId(demoCustomer.getId())
                .policyType("Health")
                .policyNumber("SC-HLT-DEMO")
                .premiumAmount(new BigDecimal("8500"))
                .sumAssured(new BigDecimal("500000"))
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2026, 1, 1))
                .status("active")
                .createdBy(admin.getId())
                .build());

        log.info("Seed complete.");
    }
}
