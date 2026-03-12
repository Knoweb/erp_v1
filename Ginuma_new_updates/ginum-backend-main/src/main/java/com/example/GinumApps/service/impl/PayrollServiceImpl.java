package com.example.GinumApps.service.impl;

import com.example.GinumApps.dto.EmployeeSalaryDto;
import com.example.GinumApps.dto.PayrollRequestDto;
import com.example.GinumApps.dto.PayrollResponseDto;
import com.example.GinumApps.enums.AccountType;
import com.example.GinumApps.enums.PayrollStatus;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.*;
import com.example.GinumApps.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final AppUserRepository appUserRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public PayrollResponseDto createPayroll(Integer companyId, PayrollRequestDto request, Integer userId) {
        // Validate company
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Get user — nullable: Company admins are not AppUsers
        AppUser user = (userId != null)
                ? appUserRepository.findById(userId).orElse(null)
                : null;

        // Generate payroll number
        String payrollNumber = generatePayrollNumber(companyId);

        // Create payroll
        Payroll payroll = new Payroll();
        payroll.setCompany(company);
        payroll.setPayrollNumber(payrollNumber);
        payroll.setPayPeriodStart(request.getPayPeriodStart());
        payroll.setPayPeriodEnd(request.getPayPeriodEnd());
        payroll.setPaymentDate(request.getPaymentDate());
        payroll.setStatus(PayrollStatus.DRAFT);
        payroll.setNotes(request.getNotes());
        payroll.setCreatedBy(user);

        // Create payroll items
        List<PayrollItem> items = new ArrayList<>();
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;

        for (PayrollRequestDto.PayrollItemDto itemDto : request.getPayrollItems()) {
            // Validate employee
            Employee employee = employeeRepository.findById(itemDto.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + itemDto.getEmployeeId()));

            if (!employee.getCompany().getCompanyId().equals(companyId)) {
                throw new RuntimeException("Employee does not belong to this company");
            }

            PayrollItem item = new PayrollItem();
            item.setPayroll(payroll);
            item.setEmployee(employee);
            item.setBasicSalary(itemDto.getBasicSalary());
            item.setAllowances(itemDto.getAllowances());
            item.setOvertimePay(itemDto.getOvertimePay());
            item.setBonus(itemDto.getBonus());
            item.setWorkedDays(itemDto.getWorkedDays());
            item.setOvertimeHours(itemDto.getOvertimeHours());
            item.setNotes(itemDto.getNotes());

            // Create deductions
            List<PayrollDeduction> deductions = new ArrayList<>();
            for (PayrollRequestDto.DeductionDto deductionDto : itemDto.getDeductions()) {
                PayrollDeduction deduction = new PayrollDeduction();
                deduction.setPayrollItem(item);
                deduction.setDeductionType(deductionDto.getDeductionType());
                deduction.setDescription(deductionDto.getDescription());
                deduction.setAmount(deductionDto.getAmount());
                deduction.setMandatory(deductionDto.isMandatory());
                deductions.add(deduction);
            }
            item.setDeductions(deductions);

            // Calculate totals
            item.calculateTotals();

            totalGross = totalGross.add(item.getGrossPay());
            totalDeductions = totalDeductions.add(item.getTotalDeductions());

            items.add(item);
        }

        payroll.setPayrollItems(items);
        payroll.setTotalGrossPay(totalGross);
        payroll.setTotalDeductions(totalDeductions);
        payroll.setTotalNetPay(totalGross.subtract(totalDeductions));

        // Save payroll
        Payroll savedPayroll = payrollRepository.save(payroll);

        return convertToResponseDto(savedPayroll);
    }

    @Override
    public PayrollResponseDto getPayrollById(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        return convertToResponseDto(payroll);
    }

    @Override
    public List<PayrollResponseDto> getAllPayrolls(Integer companyId) {
        List<Payroll> payrolls = payrollRepository.findByCompany_CompanyIdOrderByPayPeriodEndDesc(companyId);
        return payrolls.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PayrollResponseDto> getPayrollsByStatus(Integer companyId, PayrollStatus status) {
        List<Payroll> payrolls = payrollRepository.findByCompany_CompanyIdAndStatus(companyId, status);
        return payrolls.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PayrollResponseDto> getPayrollsByDateRange(Integer companyId, LocalDate startDate, LocalDate endDate) {
        List<Payroll> payrolls = payrollRepository.findByCompany_CompanyIdAndPayPeriodEndBetween(
                companyId, startDate, endDate);
        return payrolls.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PayrollResponseDto approvePayroll(Long payrollId, Integer userId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT payrolls can be approved");
        }

        AppUser user = (userId != null)
                ? appUserRepository.findById(userId).orElse(null)
                : null;

        payroll.setStatus(PayrollStatus.APPROVED);
        payroll.setApprovedBy(user);
        payroll.setApprovedAt(LocalDateTime.now());

        Payroll savedPayroll = payrollRepository.save(payroll);
        return convertToResponseDto(savedPayroll);
    }

    @Override
    @Transactional
    public PayrollResponseDto payPayroll(Long payrollId, Integer userId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() != PayrollStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED payrolls can be paid");
        }

        AppUser user = (userId != null)
                ? appUserRepository.findById(userId).orElse(null)
                : null;

        // Create journal entry for payroll payment
        JournalEntry journalEntry = createPayrollJournalEntry(payroll, userId);

        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaidAt(LocalDateTime.now());

        Payroll savedPayroll = payrollRepository.save(payroll);
        return convertToResponseDto(savedPayroll);
    }

    @Override
    @Transactional
    public PayrollResponseDto cancelPayroll(Long payrollId, Integer userId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() == PayrollStatus.PAID) {
            throw new RuntimeException("Cannot cancel a PAID payroll");
        }

        payroll.setStatus(PayrollStatus.CANCELLED);

        Payroll savedPayroll = payrollRepository.save(payroll);
        return convertToResponseDto(savedPayroll);
    }

    @Override
    @Transactional
    public void deletePayroll(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() == PayrollStatus.PAID) {
            throw new RuntimeException("Cannot delete a PAID payroll");
        }

        payrollRepository.delete(payroll);
    }

    @Override
    public String generatePayrollNumber(Integer companyId) {
        // Format: PAY-YYYY-NNN
        int year = LocalDate.now().getYear();
        Payroll lastPayroll = payrollRepository
                .findTopByCompany_CompanyIdOrderByIdDesc(companyId)
                .orElse(null);

        int nextNumber = 1;
        if (lastPayroll != null && lastPayroll.getPayrollNumber() != null) {
            String lastNumber = lastPayroll.getPayrollNumber();
            if (lastNumber.startsWith("PAY-" + year + "-")) {
                try {
                    String numberPart = lastNumber.substring(("PAY-" + year + "-").length());
                    nextNumber = Integer.parseInt(numberPart) + 1;
                } catch (Exception e) {
                    // If parsing fails, start from 1
                    nextNumber = 1;
                }
            }
        }

        return String.format("PAY-%d-%03d", year, nextNumber);
    }

    @Override
    @Transactional
    public EmployeeSalaryDto createOrUpdateEmployeeSalary(Integer companyId, Long employeeId,
            EmployeeSalaryDto salaryDto) {
        // Validate employee
        Employee employee = employeeRepository.findById(employeeId.intValue())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Employee does not belong to this company");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Deactivate previous salary if exists
        EmployeeSalary previousSalary = employeeSalaryRepository
                .findByEmployee_EmployeeIdAndIsActiveTrue(employeeId.intValue())
                .orElse(null);

        if (previousSalary != null) {
            previousSalary.setActive(false);
            previousSalary.setEffectiveTo(salaryDto.getEffectiveFrom().minusDays(1));
            employeeSalaryRepository.save(previousSalary);
        }

        // Create new salary record
        EmployeeSalary newSalary = new EmployeeSalary();
        newSalary.setEmployee(employee);
        newSalary.setCompany(company);
        newSalary.setBasicSalary(salaryDto.getBasicSalary());
        newSalary.setHousingAllowance(salaryDto.getHousingAllowance());
        newSalary.setTransportAllowance(salaryDto.getTransportAllowance());
        newSalary.setOtherAllowances(salaryDto.getOtherAllowances());
        newSalary.setFrequency(salaryDto.getFrequency());
        newSalary.setEffectiveFrom(salaryDto.getEffectiveFrom());
        newSalary.setActive(true);

        EmployeeSalary saved = employeeSalaryRepository.save(newSalary);

        return convertSalaryToDto(saved);
    }

    @Override
    public EmployeeSalaryDto getEmployeeSalary(Long employeeId) {
        EmployeeSalary salary = employeeSalaryRepository
                .findByEmployee_EmployeeIdAndIsActiveTrue(employeeId.intValue())
                .orElseThrow(() -> new RuntimeException("Employee salary not found"));

        return convertSalaryToDto(salary);
    }

    @Override
    public List<EmployeeSalaryDto> getEmployeeSalaryHistory(Long employeeId) {
        List<EmployeeSalary> salaries = employeeSalaryRepository
                .findByEmployee_EmployeeIdOrderByEffectiveFromDesc(employeeId.intValue());

        return salaries.stream()
                .map(this::convertSalaryToDto)
                .collect(Collectors.toList());
    }

    private JournalEntry createPayrollJournalEntry(Payroll payroll, Integer userId) {
        JournalEntry entry = new JournalEntry();
        entry.setCompany(payroll.getCompany());
        entry.setEntryDate(payroll.getPaymentDate());
        entry.setReferenceNo(payroll.getPayrollNumber());
        entry.setJournalTitle("Payroll Payment - " + payroll.getPayrollNumber());
        entry.setDescription("Payroll for period " + payroll.getPayPeriodStart() + " to " + payroll.getPayPeriodEnd());
        entry.setAuthorId(userId);

        List<JournalEntryLine> lines = new ArrayList<>();

        // Find salary expense account (you may want to make this configurable)
        Account salaryExpenseAccount = findOrCreateAccount(payroll.getCompany(), "Salary Expense", "EXPENSE");

        // Debit: Salary Expense (Total Gross Pay)
        JournalEntryLine debitLine = new JournalEntryLine();
        debitLine.setJournalEntry(entry);
        debitLine.setAccount(salaryExpenseAccount);
        debitLine.setAmount(payroll.getTotalGrossPay());
        debitLine.setDebit(true);
        debitLine.setDescription("Salary expense for payroll " + payroll.getPayrollNumber());
        lines.add(debitLine);

        // Credit: Cash/Bank Account (Net Pay)
        Account cashAccount = findOrCreateAccount(payroll.getCompany(), "Cash", "ASSET_BANK");
        JournalEntryLine creditCashLine = new JournalEntryLine();
        creditCashLine.setJournalEntry(entry);
        creditCashLine.setAccount(cashAccount);
        creditCashLine.setAmount(payroll.getTotalNetPay());
        creditCashLine.setDebit(false);
        creditCashLine.setDescription("Net pay for payroll " + payroll.getPayrollNumber());
        lines.add(creditCashLine);

        // Credit: Payroll Deductions Payable (if there are deductions)
        if (payroll.getTotalDeductions().compareTo(BigDecimal.ZERO) > 0) {
            Account deductionsPayableAccount = findOrCreateAccount(payroll.getCompany(), "Payroll Deductions Payable",
                    "LIABILITY_CURRENT");
            JournalEntryLine creditDeductionsLine = new JournalEntryLine();
            creditDeductionsLine.setJournalEntry(entry);
            creditDeductionsLine.setAccount(deductionsPayableAccount);
            creditDeductionsLine.setAmount(payroll.getTotalDeductions());
            creditDeductionsLine.setDebit(false);
            creditDeductionsLine.setDescription("Payroll deductions for " + payroll.getPayrollNumber());
            lines.add(creditDeductionsLine);
        }

        entry.setJournalEntryLines(lines);

        return journalEntryRepository.save(entry);
    }

    private Account findOrCreateAccount(Company company, String accountName, String accountType) {
        // Try to find existing account
        List<Account> accounts = accountRepository.findByCompany_CompanyId(company.getCompanyId());
        return accounts.stream()
                .filter(a -> a.getAccountName().equalsIgnoreCase(accountName))
                .findFirst()
                .orElseGet(() -> {
                    // Map string to AccountType enum
                    AccountType type;
                    try {
                        type = AccountType.valueOf(accountType);
                    } catch (IllegalArgumentException e) {
                        type = AccountType.EXPENSE; // safe default
                    }

                    Account newAccount = new Account();
                    newAccount.setCompany(company);
                    newAccount.setAccountName(accountName);
                    newAccount.setAccountType(type); // ✅ set enum
                    newAccount.setAccountCode(generateAccountCode(company, accountType));
                    return accountRepository.save(newAccount);
                });
    }

    private String generateAccountCode(Company company, String accountType) {
        // Simple account code generation - you may want to make this more sophisticated
        long count = accountRepository.findByCompany_CompanyId(company.getCompanyId()).size();
        return accountType.substring(0, 1) + String.format("%04d", count + 1);
    }

    private PayrollResponseDto convertToResponseDto(Payroll payroll) {
        PayrollResponseDto dto = new PayrollResponseDto();
        dto.setId(payroll.getId());
        dto.setPayrollNumber(payroll.getPayrollNumber());
        dto.setPayPeriodStart(payroll.getPayPeriodStart());
        dto.setPayPeriodEnd(payroll.getPayPeriodEnd());
        dto.setPaymentDate(payroll.getPaymentDate());
        dto.setStatus(payroll.getStatus());
        dto.setTotalGrossPay(payroll.getTotalGrossPay());
        dto.setTotalDeductions(payroll.getTotalDeductions());
        dto.setTotalNetPay(payroll.getTotalNetPay());
        dto.setNotes(payroll.getNotes());
        dto.setCreatedAt(payroll.getCreatedAt());
        dto.setCreatedBy(payroll.getCreatedBy() != null ? payroll.getCreatedBy().getEmail() : null);
        dto.setApprovedAt(payroll.getApprovedAt());
        dto.setApprovedBy(payroll.getApprovedBy() != null ? payroll.getApprovedBy().getEmail() : null);
        dto.setPaidAt(payroll.getPaidAt());

        // Convert payroll items
        List<PayrollResponseDto.PayrollItemResponseDto> itemDtos = new ArrayList<>();
        for (PayrollItem item : payroll.getPayrollItems()) {
            PayrollResponseDto.PayrollItemResponseDto itemDto = new PayrollResponseDto.PayrollItemResponseDto();
            itemDto.setId(item.getId());
            itemDto.setEmployeeId(item.getEmployee().getEmployeeId());
            // ✅ Employee name & NIC
            String fullName = (item.getEmployee().getFirstName() != null ? item.getEmployee().getFirstName() : "")
                    + " "
                    + (item.getEmployee().getLastName() != null ? item.getEmployee().getLastName() : "");
            itemDto.setEmployeeName(fullName.trim());
            itemDto.setNic(item.getEmployee().getNic());
            itemDto.setBasicSalary(item.getBasicSalary());
            itemDto.setAllowances(item.getAllowances());
            itemDto.setOvertimePay(item.getOvertimePay());
            itemDto.setBonus(item.getBonus());
            itemDto.setGrossPay(item.getGrossPay());
            itemDto.setTotalDeductions(item.getTotalDeductions());
            itemDto.setNetPay(item.getNetPay());
            itemDto.setWorkedDays(item.getWorkedDays());
            itemDto.setOvertimeHours(item.getOvertimeHours());
            itemDto.setNotes(item.getNotes());

            // Convert deductions
            List<PayrollResponseDto.DeductionResponseDto> deductionDtos = new ArrayList<>();
            for (PayrollDeduction deduction : item.getDeductions()) {
                PayrollResponseDto.DeductionResponseDto deductionDto = new PayrollResponseDto.DeductionResponseDto();
                deductionDto.setId(deduction.getId());
                deductionDto.setDeductionType(deduction.getDeductionType());
                deductionDto.setDescription(deduction.getDescription());
                deductionDto.setAmount(deduction.getAmount());
                deductionDto.setMandatory(deduction.isMandatory());
                deductionDtos.add(deductionDto);
            }
            itemDto.setDeductions(deductionDtos);

            itemDtos.add(itemDto);
        }
        dto.setPayrollItems(itemDtos);

        return dto;
    }

    private EmployeeSalaryDto convertSalaryToDto(EmployeeSalary salary) {
        EmployeeSalaryDto dto = new EmployeeSalaryDto();
        dto.setId(salary.getId());
        dto.setEmployeeId(salary.getEmployee().getEmployeeId());
        dto.setBasicSalary(salary.getBasicSalary());
        dto.setHousingAllowance(salary.getHousingAllowance());
        dto.setTransportAllowance(salary.getTransportAllowance());
        dto.setOtherAllowances(salary.getOtherAllowances());
        dto.setFrequency(salary.getFrequency());
        dto.setEffectiveFrom(salary.getEffectiveFrom());
        dto.setEffectiveTo(salary.getEffectiveTo());
        dto.setActive(salary.isActive());
        return dto;
    }
}
