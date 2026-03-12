package com.inventory.subscription.model;

import com.inventory.subscription.enums.CompanyStatus;
import com.inventory.subscription.util.JsonListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "company_tenant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyTenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "org_id", unique = true, nullable = false)
    private Long orgId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private CompanyStatus status = CompanyStatus.ACTIVE;

    /**
     * Plan type: "TRIAL" or "PAID"
     * Distinguishes between trial and paid customers
     */
    @Column(name = "plan_type")
    @Builder.Default
    private String planType = "TRIAL";

    /**
     * JSON column storing subscribed system codes
     * Examples: ["GINUMA"], ["INVENTORY"], ["GINUMA", "INVENTORY"]
     * Maps to database JSON column using JsonListConverter
     */
    @Convert(converter = JsonListConverter.class)
    @Column(name = "subscribed_systems", columnDefinition = "JSON")
    @Builder.Default
    private List<String> subscribedSystems = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "companyTenant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SystemSubscription> subscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "companyTenant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentRecord> paymentRecords = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = CompanyStatus.ACTIVE;
        }
        if (planType == null || planType.isBlank()) {
            planType = "TRIAL";
        }
        if (subscribedSystems == null) {
            subscribedSystems = new ArrayList<>();
        }
    }

    /**
     * Helper method to add a system to subscribed systems
     */
    public void addSubscribedSystem(String systemCode) {
        if (subscribedSystems == null) {
            subscribedSystems = new ArrayList<>();
        }
        if (!subscribedSystems.contains(systemCode)) {
            subscribedSystems.add(systemCode);
        }
    }

    /**
     * Helper method to check if company has access to a system
     */
    public boolean hasAccessToSystem(String systemCode) {
        return subscribedSystems != null && subscribedSystems.contains(systemCode);
    }
}
