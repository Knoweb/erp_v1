package com.example.GinumApps.service;

import com.example.GinumApps.dto.*;
import com.example.GinumApps.enums.JournalEntryType;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.model.*;
import com.example.GinumApps.enums.*;
import com.example.GinumApps.repository.*;
import java.util.Optional;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesOrderService {
    private final CompanyRepository companyRepo;
    private final CustomerRepository customerRepo;
    private final SalesOrderRepository salesOrderRepo;
    private final AccountRepository accountRepo;
    private final ItemRepository itemRepo;
    private final ProjectRepository projectRepo;
    private final JournalEntryService journalService;
    private final AgingReceivableSnapshotRepository agingReceivableSnapshotRepo;

    public String getNextSoNumber(Integer companyId) {
        // COUNT-based generation: total orders for this company + 1
        // This prevents duplicate errors even if MAX(soNumber) acts incorrectly
        long count = salesOrderRepo.countByCompanyId(companyId.longValue());
        long nextNum = count + 1;

        // Make sure the generated number doesn't already exist (safety check)
        String candidate = String.format("SO-%08d", nextNum);
        String lastSo = salesOrderRepo.findLastSoNumberByCompanyId(companyId.longValue());
        if (lastSo != null && !lastSo.isEmpty()) {
            try {
                String numPart = lastSo.startsWith("SO-") ? lastSo.substring(3) : lastSo;
                long lastNum = Long.parseLong(numPart);
                if (lastNum >= nextNum) {
                    // MAX is ahead of count — use MAX+1 to avoid collision
                    candidate = String.format("SO-%08d", lastNum + 1);
                }
            } catch (NumberFormatException ignored) {
                // fallback to count-based if MAX is not parseable
            }
        }
        return candidate;
    }

    public List<SalesOrderResponseDto> getAllSalesOrdersByCompany(Integer companyId) {
        return salesOrderRepo.findByCompany_CompanyId(companyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public SalesOrderResponseDto getSalesOrderById(Long id, Integer companyId) {
        SalesOrder order = salesOrderRepo.findById(id)
                .orElseThrow(() -> new com.example.GinumApps.exception.ResourceNotFoundException("Sales Order not found with ID: " + id));
        if (companyId != null && (order.getCompany() == null || !order.getCompany().getCompanyId().equals(companyId))) {
            throw new org.springframework.security.access.AccessDeniedException("You don't have access to this order.");
        }
        return convertToDto(order);
    }

    @Transactional
    public SalesOrderResponseDto createSalesOrder(SalesOrderRequestDto request, Integer companyId) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Customer customer = customerRepo.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (!customer.getCompany().getCompanyId().equals(companyId)) {
            throw new AccessDeniedException("Customer does not belong to your company");
        }

        Account paymentAccount = null;
        if (request.getPaymentAccountCode() != null) {
            paymentAccount = accountRepo.findByAccountCodeAndCompany_CompanyId(
                    request.getPaymentAccountCode(), companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid payment account code"));
        }

        SalesOrder order = new SalesOrder();
        order.setCompany(company);
        order.setCustomer(customer);
        order.setSoNumber(request.getSoNumber());
        order.setIssueDate(request.getIssueDate());
        order.setNotes(request.getNotes());
        order.setPaymentAccount(paymentAccount);
        order.setAmountPaid(request.getAmountPaid());
        order.setSalesType(request.getSalesType());
        order.setFreight(request.getFreight());

        if (request.getTaxBreakdown() != null) {
            List<com.example.GinumApps.model.TaxBreakdown> taxes = request.getTaxBreakdown().stream().map(dto -> {
                com.example.GinumApps.model.TaxBreakdown t = new com.example.GinumApps.model.TaxBreakdown();
                t.setTaxType(dto.getTaxType());
                t.setPercentage(dto.getPercentage());
                t.setAmount(dto.getAmount());
                return t;
            }).collect(java.util.stream.Collectors.toList());
            order.setTaxBreakdown(taxes);
        }

        System.err.println("DEBUG: Starting processItems for " + order.getSoNumber());
        processItems(request.getItems(), order, company);
        
        System.err.println("DEBUG: Starting calculateFinancials");
        calculateFinancials(order);
        
        System.err.println("DEBUG: Starting validateCompanyAccounts");
        validateCompanyAccounts(company, order);

        System.err.println("DEBUG: Saving SalesOrder to DB");
        SalesOrder savedOrder = salesOrderRepo.save(order);
        
        System.err.println("DEBUG: Creating Journal Entries");
        try {
            createJournalEntries(savedOrder);
        } catch (Exception je) {
            System.err.println("DEBUG: CRITICAL ERROR in Journal Entry creation: " + je.getMessage());
            je.printStackTrace();
            throw je;
        }

        System.err.println("DEBUG: Sales Order Created Successfully");
        return convertToDto(savedOrder);
    }

    private void processItems(List<SalesOrderItemRequestDto> items, SalesOrder order, Company company) {
        items.forEach(itemRequest -> {
            Item item = null;
            if (itemRequest.getItemId() != null) {
                item = itemRepo.findById(itemRequest.getItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemRequest.getItemId()));
            }
            Account account = accountRepo.findByAccountCodeAndCompany_CompanyId(
                    itemRequest.getAccountCode(), company.getCompanyId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Account not found: " + itemRequest.getAccountCode()));

            Project project = null;
            if (itemRequest.getProjectId() != null) {
                project = projectRepo.findById(itemRequest.getProjectId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Project not found: " + itemRequest.getProjectId()));
            }

            SalesOrderLineItem line = new SalesOrderLineItem();
            line.setSalesOrder(order);
            line.setItem(item);
            line.setDescription(itemRequest.getDescription());
            line.setQuantity(itemRequest.getQuantity());
            line.setUnitPrice(itemRequest.getUnitPrice());
            line.setDiscountPercent(itemRequest.getDiscountPercent());
            line.setAccount(account);
            line.setProject(project);
            line.setItemType(itemRequest.getItemType());
            order.getItems().add(line);
        });
    }

    private void calculateFinancials(SalesOrder order) {
        BigDecimal subtotal = order.getItems().stream()
                .map(item -> {
                    BigDecimal base = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal discountAmt = base.multiply(item.getDiscountPercent()
                            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                    BigDecimal lineAmount = base.subtract(discountAmt).setScale(2, RoundingMode.HALF_UP);
                    item.setAmount(lineAmount);
                    return lineAmount;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        BigDecimal freight = order.getFreight() != null ? order.getFreight().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        order.setFreight(freight);

        BigDecimal subtotalPlusFreight = subtotal.add(freight);
        
        BigDecimal calculatedTaxAmount = BigDecimal.ZERO;
        if (order.getTaxBreakdown() != null) {
            calculatedTaxAmount = order.getTaxBreakdown().stream()
                .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        order.setTaxAmount(calculatedTaxAmount);
        
        order.setTotal(subtotalPlusFreight.add(order.getTaxAmount()).setScale(2, RoundingMode.HALF_UP));
        order.setBalanceDue(order.getTotal().subtract(order.getAmountPaid() != null ? order.getAmountPaid().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO));
    }

    private void validateCompanyAccounts(Company company, SalesOrder order) {
        if (order.getBalanceDue().compareTo(BigDecimal.ZERO) > 0 && getAccountsReceivableAccount(company) == null) {
            throw new IllegalStateException("Accounts Receivable account (code 1100) is not configured or missing for this company. Please ensure it exists in your Chart of Accounts.");
        }
        if (order.getTaxAmount().compareTo(BigDecimal.ZERO) > 0 && getTaxAccount(company) == null) {
            throw new IllegalStateException("Sales Tax account (code 5200) is not configured or missing for this company. Please ensure it exists in your Chart of Accounts.");
        }
        if (order.getFreight().compareTo(BigDecimal.ZERO) > 0 && getFreightAccount(company) == null) {
            throw new IllegalStateException("Freight Revenue account (code 5100) is not configured or missing for this company. Please ensure it exists in your Chart of Accounts.");
        }
        if (order.getAmountPaid().compareTo(BigDecimal.ZERO) > 0 && order.getPaymentAccount() == null) {
            throw new IllegalArgumentException("Payment account is required when amount paid is greater than zero.");
        }
    }

    private Account getAccountsReceivableAccount(Company company) {
        if (company.getAccountsReceivableAccount() != null) return company.getAccountsReceivableAccount();
        // Fallback 1: Try code 1100
        Optional<Account> byCode = accountRepo.findByAccountCodeAndCompany_CompanyId(Company.RECEIVABLE_ACCOUNT_CODE, company.getCompanyId());
        if (byCode.isPresent()) return byCode.get();
        // Fallback 2: Try any account of type ASSET_ACCOUNT_RECEIVABLE
        return accountRepo.findFirstByAccountTypeAndCompany_CompanyId(AccountType.ASSET_ACCOUNT_RECEIVABLE, company.getCompanyId()).orElse(null);
    }

    private Account getTaxAccount(Company company) {
        if (company.getTaxAccount() != null) return company.getTaxAccount();
        // Fallback 1: Try code 5200
        Optional<Account> byCode = accountRepo.findByAccountCodeAndCompany_CompanyId(Company.TAX_ACCOUNT_CODE, company.getCompanyId());
        if (byCode.isPresent()) return byCode.get();
        // Fallback 2: Try by name "Sales Tax" (Normalized)
        Optional<Account> byName = accountRepo.findFirstByNormalizedNameAndCompany_CompanyId("SALESTAX", company.getCompanyId());
        if (byName.isPresent()) return byName.get();
        // Fallback 3: Try any Expense account (common classification)
        return accountRepo.findFirstByAccountTypeAndCompany_CompanyId(AccountType.EXPENSE, company.getCompanyId()).orElse(null);
    }

    private Account getFreightAccount(Company company) {
        if (company.getFreightAccount() != null) return company.getFreightAccount();
        // Fallback 1: Try code 5100
        Optional<Account> byCode = accountRepo.findByAccountCodeAndCompany_CompanyId(Company.FREIGHT_ACCOUNT_CODE, company.getCompanyId());
        if (byCode.isPresent()) return byCode.get();
        // Fallback 2: Try by name "Freight" (Normalized)
        Optional<Account> byName = accountRepo.findFirstByNormalizedNameAndCompany_CompanyId("FREIGHT", company.getCompanyId());
        if (byName.isPresent()) return byName.get();
        // Fallback 3: Try any Expense account
        return accountRepo.findFirstByAccountTypeAndCompany_CompanyId(AccountType.EXPENSE, company.getCompanyId()).orElse(null);
    }

    private void createJournalEntries(SalesOrder order) {
        JournalEntryDto journal = new JournalEntryDto();
        journal.setEntryType(JournalEntryType.SALE);
        journal.setEntryDate(order.getIssueDate());
        journal.setJournalTitle("Sales Journal");
        journal.setReferenceNo(order.getSoNumber());
        journal.setCompanyId(order.getCompany().getCompanyId());
        journal.setDescription("Sales Order #" + order.getId());

        List<JournalEntryLineDto> lines = new ArrayList<>();

        // Credit items (Revenue)
        for (SalesOrderLineItem item : order.getItems()) {
            BigDecimal lineTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal discount = lineTotal.multiply(item.getDiscountPercent()
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            BigDecimal amountAfterDiscount = lineTotal.subtract(discount).setScale(2, RoundingMode.HALF_UP);

            System.err.println("DEBUG: Journal Line - Revenue: " + item.getAccount().getAccountCode() + " Amount: " + amountAfterDiscount);
            lines.add(new JournalEntryLineDto(
                    item.getAccount().getAccountCode(),
                    amountAfterDiscount,
                    false, // Credit Revenue
                    item.getDescription()));
        }

        // Credit Freight Revenue if applicable
        if (order.getFreight().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal freightAmt = order.getFreight().setScale(2, RoundingMode.HALF_UP);
            Account freightAcc = getFreightAccount(order.getCompany());
            System.err.println("DEBUG: Journal Line - Freight: " + (freightAcc != null ? freightAcc.getAccountCode() : "NULL") + " Amount: " + freightAmt);
            lines.add(new JournalEntryLineDto(
                    freightAcc.getAccountCode(),
                    freightAmt,
                    false, // Credit Freight Revenue
                    "Freight Charges"));
        }

        // Credit Tax Liability if applicable
        if (order.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxAmt = order.getTaxAmount().setScale(2, RoundingMode.HALF_UP);
            Account taxAcc = getTaxAccount(order.getCompany());
            System.err.println("DEBUG: Journal Line - Tax: " + (taxAcc != null ? taxAcc.getAccountCode() : "NULL") + " Amount: " + taxAmt);
            lines.add(new JournalEntryLineDto(
                    taxAcc.getAccountCode(),
                    taxAmt,
                    false, // Credit Tax
                    "Sales Tax"));
        }

        // Debit payment account if payment made (Cash/Bank)
        if (order.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal paidAmt = order.getAmountPaid().setScale(2, RoundingMode.HALF_UP);
            System.err.println("DEBUG: Journal Line - Payment: " + order.getPaymentAccount().getAccountCode() + " Amount: " + paidAmt);
            lines.add(new JournalEntryLineDto(
                    order.getPaymentAccount().getAccountCode(),
                    paidAmt,
                    true, // Debit Asset
                    "Received Payment"));
        }

        // Debit Accounts Receivable for remaining balance
        if (order.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal receivableAmt = order.getBalanceDue().setScale(2, RoundingMode.HALF_UP);
            Account recAcc = getAccountsReceivableAccount(order.getCompany());
            System.err.println("DEBUG: Journal Line - Receivable: " + (recAcc != null ? recAcc.getAccountCode() : "NULL") + " Amount: " + receivableAmt);
            lines.add(new JournalEntryLineDto(
                    recAcc.getAccountCode(),
                    receivableAmt,
                    true, // Debit Asset
                    "Receivable from " + order.getCustomer().getName()));
        }

        journal.setLines(lines);
        journalService.createJournalEntry(journal);
    }

    private void createAgingReceivableSnapshot(SalesOrder order) {
        AgingReceivableSnapshot snapshot = new AgingReceivableSnapshot();
        snapshot.setCompany(order.getCompany());
        snapshot.setCustomer(order.getCustomer());
        snapshot.setSoNumber(order.getSoNumber());
        snapshot.setDueDate(order.getDueDate());
        snapshot.setBalanceDue(order.getBalanceDue());
        snapshot.setSnapshotDate(LocalDate.now());

        snapshot.computeBuckets(LocalDate.now());

        agingReceivableSnapshotRepo.save(snapshot);
    }

    @Transactional
    public void paySalesOrder(Long soId, SalesPaymentRequestDto request) {
        SalesOrder order = salesOrderRepo.findById(soId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order not found"));

        if (!order.getCompany().getCompanyId().equals(request.getCompanyId())) {
            throw new AccessDeniedException("Sales Order does not belong to your company");
        }

        if (order.getBalanceDue().compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalStateException("Sales Order is already fully paid");
        }

        if (request.getAmount().compareTo(order.getBalanceDue()) > 0) {
            throw new IllegalArgumentException("Payment exceeds remaining balance");
        }

        Account paymentAccount = accountRepo.findByAccountCodeAndCompany_CompanyId(
                request.getPaymentAccountCode(), request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment account not found"));

        // Update balances
        order.setAmountPaid(order.getAmountPaid().add(request.getAmount()));
        order.setBalanceDue(order.getBalanceDue().subtract(request.getAmount()));
        salesOrderRepo.save(order);

        // Create Journal Entry
        JournalEntryDto journal = new JournalEntryDto();
        journal.setEntryType(JournalEntryType.RECEIPT);
        journal.setEntryDate(LocalDate.now());
        journal.setJournalTitle("Sales Payment");
        journal.setReferenceNo(order.getSoNumber());
        journal.setCompanyId(request.getCompanyId());
        journal.setDescription("Payment received for SO #" + order.getId());

        List<JournalEntryLineDto> lines = new ArrayList<>();

        // Debit payment account (we received money)
        lines.add(new JournalEntryLineDto(
                paymentAccount.getAccountCode(),
                request.getAmount(),
                true,
                "Customer payment received"));

        // Credit accounts receivable
        Account arAccount = getAccountsReceivableAccount(order.getCompany());
        if (arAccount == null) {
            throw new ResourceNotFoundException("No Accounts Receivable account (Code 1100) found for this company. Please configure it in Chart of Accounts.");
        }
        
        lines.add(new JournalEntryLineDto(
                arAccount.getAccountCode(),
                request.getAmount(),
                false,
                "Reduce receivable from customer"));

        journal.setLines(lines);
        journalService.createJournalEntry(journal);

        // OPTIONAL: Update aging snapshot
        // You can remove or update the corresponding aging snapshot here if needed.
    }

    private SalesOrderResponseDto convertToDto(SalesOrder order) {
        SalesOrderResponseDto dto = new SalesOrderResponseDto();
        dto.setId(order.getId());
        dto.setCustomerId(order.getCustomer().getId());
        dto.setCustomerName(order.getCustomer().getName());
        dto.setSoNumber(order.getSoNumber());
        dto.setIssueDate(order.getIssueDate());
        dto.setNotes(order.getNotes());
        dto.setSubtotal(order.getSubtotal());
        if (order.getTaxBreakdown() != null) {
            List<com.example.GinumApps.dto.TaxBreakdownDto> taxDtos = order.getTaxBreakdown().stream().map(t -> {
                com.example.GinumApps.dto.TaxBreakdownDto tdto = new com.example.GinumApps.dto.TaxBreakdownDto();
                tdto.setTaxType(t.getTaxType());
                tdto.setPercentage(t.getPercentage());
                tdto.setAmount(t.getAmount());
                return tdto;
            }).collect(java.util.stream.Collectors.toList());
            dto.setTaxBreakdown(taxDtos);
        }
        dto.setTaxAmount(order.getTaxAmount());
        dto.setFreight(order.getFreight());
        dto.setTotal(order.getTotal());
        dto.setAmountPaid(order.getAmountPaid());
        dto.setBalanceDue(order.getBalanceDue());
        dto.setSalesType(order.getSalesType());
        dto.setItems(order.getItems().stream().map(this::convertLineToDto).collect(Collectors.toList()));
        return dto;
    }

    private SalesOrderItemResponseDto convertLineToDto(SalesOrderLineItem item) {
        SalesOrderItemResponseDto dto = new SalesOrderItemResponseDto();
        if (item.getItem() != null) {
            dto.setItemId(item.getItem().getItemId());
            dto.setItemName(item.getItem().getName());
        }
        dto.setDescription(item.getDescription());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setDiscountPercent(item.getDiscountPercent());
        dto.setAmount(item.getAmount());
        dto.setAccountCode(item.getAccount().getAccountCode());
        dto.setProjectId(item.getProject() != null ? item.getProject().getId() : null);
        dto.setItemType(item.getItemType());
        return dto;
    }
}