package com.example.GinumApps.controller;

import com.example.GinumApps.dto.EmployeeSalaryDto;
import com.example.GinumApps.dto.PayrollRequestDto;
import com.example.GinumApps.dto.PayrollResponseDto;
import com.example.GinumApps.enums.PayrollStatus;
import com.example.GinumApps.model.AppUser;
import com.example.GinumApps.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    /**
     * Returns the AppUser's ID if logged in as AppUser,
     * or null if logged in as Company admin (no AppUser record).
     */
    private Integer resolveUserId(Object principal) {
        if (principal instanceof AppUser appUser) {
            return appUser.getId();
        }
        return null; // Company admin — service handles null userId
    }

    @PostMapping
    public ResponseEntity<?> createPayroll(
            @PathVariable Integer companyId,
            @Valid @RequestBody PayrollRequestDto request,
            @AuthenticationPrincipal Object principal) {
        try {
            Integer userId = resolveUserId(principal);
            PayrollResponseDto payroll = payrollService.createPayroll(companyId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(payroll);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<PayrollResponseDto>> getAllPayrolls(@PathVariable Integer companyId) {
        return ResponseEntity.ok(payrollService.getAllPayrolls(companyId));
    }

    @GetMapping("/{payrollId}")
    public ResponseEntity<?> getPayrollById(@PathVariable Long payrollId) {
        try {
            return ResponseEntity.ok(payrollService.getPayrollById(payrollId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PayrollResponseDto>> getPayrollsByStatus(
            @PathVariable Integer companyId,
            @PathVariable PayrollStatus status) {
        return ResponseEntity.ok(payrollService.getPayrollsByStatus(companyId, status));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<PayrollResponseDto>> getPayrollsByDateRange(
            @PathVariable Integer companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(payrollService.getPayrollsByDateRange(companyId, startDate, endDate));
    }

    @PostMapping("/{payrollId}/approve")
    public ResponseEntity<?> approvePayroll(
            @PathVariable Long payrollId,
            @AuthenticationPrincipal Object principal) {
        try {
            Integer userId = resolveUserId(principal);
            return ResponseEntity.ok(payrollService.approvePayroll(payrollId, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{payrollId}/pay")
    public ResponseEntity<?> payPayroll(
            @PathVariable Long payrollId,
            @AuthenticationPrincipal Object principal) {
        try {
            Integer userId = resolveUserId(principal);
            return ResponseEntity.ok(payrollService.payPayroll(payrollId, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{payrollId}/cancel")
    public ResponseEntity<?> cancelPayroll(
            @PathVariable Long payrollId,
            @AuthenticationPrincipal Object principal) {
        try {
            Integer userId = resolveUserId(principal);
            return ResponseEntity.ok(payrollService.cancelPayroll(payrollId, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{payrollId}")
    public ResponseEntity<?> deletePayroll(@PathVariable Long payrollId) {
        try {
            payrollService.deletePayroll(payrollId);
            return ResponseEntity.ok(Map.of("message", "Payroll deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/employees/{employeeId}/salary")
    public ResponseEntity<?> createOrUpdateSalary(
            @PathVariable Integer companyId,
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeSalaryDto salaryDto) {
        try {
            EmployeeSalaryDto salary = payrollService.createOrUpdateEmployeeSalary(companyId, employeeId, salaryDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(salary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/employees/{employeeId}/salary")
    public ResponseEntity<?> getEmployeeSalary(@PathVariable Long employeeId) {
        try {
            return ResponseEntity.ok(payrollService.getEmployeeSalary(employeeId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/employees/{employeeId}/salary/history")
    public ResponseEntity<List<EmployeeSalaryDto>> getEmployeeSalaryHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getEmployeeSalaryHistory(employeeId));
    }
}
