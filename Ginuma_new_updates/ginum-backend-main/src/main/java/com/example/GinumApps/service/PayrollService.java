package com.example.GinumApps.service;

import com.example.GinumApps.dto.EmployeeSalaryDto;
import com.example.GinumApps.dto.PayrollRequestDto;
import com.example.GinumApps.dto.PayrollResponseDto;
import com.example.GinumApps.enums.PayrollStatus;

import java.time.LocalDate;
import java.util.List;

public interface PayrollService {
    
    PayrollResponseDto createPayroll(Integer companyId, PayrollRequestDto request, Integer userId);
    
    PayrollResponseDto getPayrollById(Long payrollId);
    
    List<PayrollResponseDto> getAllPayrolls(Integer companyId);
    
    List<PayrollResponseDto> getPayrollsByStatus(Integer companyId, PayrollStatus status);
    
    List<PayrollResponseDto> getPayrollsByDateRange(
        Integer companyId,
        LocalDate startDate,
        LocalDate endDate
    );
    
    PayrollResponseDto approvePayroll(Long payrollId, Integer userId);
    
    PayrollResponseDto payPayroll(Long payrollId, Integer userId);
    
    PayrollResponseDto cancelPayroll(Long payrollId, Integer userId);
    
    void deletePayroll(Long payrollId);
    
    String generatePayrollNumber(Integer companyId);
    
    // Employee Salary Management
    EmployeeSalaryDto createOrUpdateEmployeeSalary(Integer companyId, Long employeeId, EmployeeSalaryDto salaryDto);
    
    EmployeeSalaryDto getEmployeeSalary(Long employeeId);
    
    List<EmployeeSalaryDto> getEmployeeSalaryHistory(Long employeeId);
}
