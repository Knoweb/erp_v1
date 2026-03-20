package com.example.GinumApps.model;

import com.example.GinumApps.enums.AccountType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "accounts", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "company_id", "accountCode" }),
        @UniqueConstraint(columnNames = { "company_id", "normalizedName" })
})
@RequiredArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String accountName;

    private String subAccountName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;

    @Column(nullable = false)
    private String accountCode;

    @Column(nullable = false)
    private String normalizedName;

    @Column(nullable = false)
    private String normalizedSubAccount = "";

    @Version
    private Long version;

    @Column(precision = 19, scale = 2)
    private BigDecimal currentBalance;

    @Column(precision = 19, scale = 2)
    private BigDecimal openingBalance;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnore
    private Company company;

    @PrePersist
    @PreUpdate
    protected void normalizeFields() {
        if (this.accountName != null) {
            this.normalizedName = this.accountName.trim().toLowerCase();
        }
        if (this.subAccountName != null) {
            this.normalizedSubAccount = this.subAccountName.trim().toLowerCase();
        } else {
            this.normalizedSubAccount = "";
        }
    }
}
