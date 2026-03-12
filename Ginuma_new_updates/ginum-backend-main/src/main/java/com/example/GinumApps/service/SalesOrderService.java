package com.example.GinumApps.service;

import com.example.GinumApps.dto.*;
import com.example.GinumApps.enums.JournalEntryType;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.*;
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

        processItems(request.getItems(), order, company);
        calculateFinancials(order);

        SalesOrder savedOrder = (SalesOrder) salesOrderRepo.save(order);
        createJournalEntries(savedOrder);

        return convertToDto(savedOrder);
    }

    private void processItems(List<SalesOrderItemRequestDto> items, SalesOrder order, Company company) {
        items.forEach(itemRequest -> {
            Item item = itemRepo.findById(itemRequest.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemRequest.getItemId()));
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
                .map(item -> item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()))
                        .multiply(BigDecimal.ONE.subtract(item.getDiscountPercent()
                                .divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setSubtotal(subtotal);
        // order.setFreight(order.getFreight() != null ? order.getFreight() :
        // BigDecimal.ZERO);
        // order.setTaxAmount(order.getTaxAmount() != null ? order.getTaxAmount() :
        // BigDecimal.ZERO);
        // order.setTotal(order.getSubtotal().add(order.getFreight()).add(order.getTaxAmount()));
        order.setTotal(subtotal);
        order.setBalanceDue(
                order.getTotal().subtract(order.getAmountPaid() != null ? order.getAmountPaid() : BigDecimal.ZERO));
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

        for (SalesOrderLineItem item : order.getItems()) {
            BigDecimal lineTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .multiply(BigDecimal.ONE.subtract(item.getDiscountPercent()
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)));

            lines.add(new JournalEntryLineDto(
                    item.getAccount().getAccountCode(),
                    lineTotal,
                    true,
                    item.getDescription()));
        }

        // Credit amountPaid if payment made
        if (order.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            lines.add(new JournalEntryLineDto(
                    order.getPaymentAccount().getAccountCode(),
                    order.getAmountPaid(),
                    false,
                    "Received Payment"));
        }

        // Credit receivable for remaining
        if (order.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            lines.add(new JournalEntryLineDto(
                    order.getCompany().getAccountsReceivableAccount().getAccountCode(),
                    order.getBalanceDue(),
                    false,
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
        lines.add(new JournalEntryLineDto(
                order.getCompany().getAccountsReceivableAccount().getAccountCode(),
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
        // dto.setTaxAmount(order.getTaxAmount());
        // dto.setFreight(order.getFreight());
        dto.setTotal(order.getTotal());
        dto.setAmountPaid(order.getAmountPaid());
        dto.setBalanceDue(order.getBalanceDue());
        dto.setSalesType(order.getSalesType());
        dto.setItems(order.getItems().stream().map(this::convertLineToDto).collect(Collectors.toList()));
        return dto;
    }

    private SalesOrderItemResponseDto convertLineToDto(SalesOrderLineItem item) {
        SalesOrderItemResponseDto dto = new SalesOrderItemResponseDto();
        dto.setItemId(item.getItem().getItemId());
        dto.setItemName(item.getItem().getName());
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