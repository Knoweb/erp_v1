package com.example.GinumApps.controller;

import com.example.GinumApps.dto.AgedReceivableResponseDto;
import com.example.GinumApps.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/aged-receivables")
@RequiredArgsConstructor
public class AgedReceivablesController {

    private final SalesOrderRepository salesOrderRepo;

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<List<AgedReceivableResponseDto>> getAgedReceivables(
            @PathVariable("companyId") Long companyId) {
        LocalDate today = LocalDate.now();

        List<AgedReceivableResponseDto> receivables = salesOrderRepo.findAll().stream()
                .filter(so -> so.getCompany().getCompanyId().equals(companyId.intValue()))
                .filter(so -> so.getBalanceDue().compareTo(BigDecimal.ZERO) > 0)
                .map(so -> {
                    AgedReceivableResponseDto dto = new AgedReceivableResponseDto();
                    dto.setCustomer(so.getCustomer().getName());
                    dto.setInvoice(so.getSoNumber());
                    dto.setInvoiceDate(so.getIssueDate());
                    dto.setDueDate(so.getDueDate() != null ? so.getDueDate() : so.getIssueDate());
                    dto.setTotal(so.getTotal());
                    dto.setBalance(so.getBalanceDue());

                    long daysOverdue = ChronoUnit.DAYS.between(dto.getDueDate(), today);

                    if (daysOverdue <= 0) {
                        dto.setNotDueYet(so.getBalanceDue());
                    } else if (daysOverdue <= 30) {
                        dto.setAge1(so.getBalanceDue());
                    } else if (daysOverdue <= 60) {
                        dto.setAge2(so.getBalanceDue());
                    } else {
                        dto.setAge3(so.getBalanceDue());
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(receivables);
    }
}
