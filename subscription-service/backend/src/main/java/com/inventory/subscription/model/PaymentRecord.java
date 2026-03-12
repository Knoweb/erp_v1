package com.inventory.subscription.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.inventory.subscription.enums.PaymentApprovalStatus;
import com.inventory.subscription.enums.SystemName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_record")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_tenant_id", nullable = false)
    @JsonIgnore
    private CompanyTenant companyTenant;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "proof_document_url", length = 500)
    private String proofDocumentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "system_name", nullable = false)
    private SystemName systemName;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private PaymentApprovalStatus approvalStatus = PaymentApprovalStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (approvalStatus == null) {
            approvalStatus = PaymentApprovalStatus.PENDING;
        }
    }
}
