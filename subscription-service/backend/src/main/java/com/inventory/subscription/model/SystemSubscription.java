package com.inventory.subscription.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.inventory.subscription.enums.SubscriptionStatus;
import com.inventory.subscription.enums.SystemName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "system_subscription")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_tenant_id", nullable = false)
    @JsonIgnore
    private CompanyTenant companyTenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "system_name", nullable = false)
    private SystemName systemName;

    @Column(name = "trial_end_date")
    private LocalDate trialEndDate;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.TRIAL;
}
