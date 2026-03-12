package com.example.GinumApps.service;

import com.example.GinumApps.dto.*;
import com.example.GinumApps.enums.JournalEntryType;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {
    private final CompanyRepository companyRepository;
    private final PurchaseOrderRepository purchaseOrderRepo;
    private final SupplierRepository supplierRepo;
    private final AccountRepository accountRepo;
    private final JournalEntryService journalEntryService;
    private final ItemRepository itemRepository;
    private final AgingPayableSnapshotRepository agingRepo;
    private final PurchaseOrderRepository poRepo;

    public String getNextPoNumber(Integer companyId) {
        // COUNT-based generation: total POs for this company + 1
        long count = purchaseOrderRepo.countByCompanyId(companyId.longValue());
        long nextNum = count + 1;

        // Safety check: if MAX is ahead of count, use MAX+1 to avoid collision
        String candidate = String.format("PO-%08d", nextNum);
        String lastPo = purchaseOrderRepo.findLastPoNumberByCompanyId(companyId.longValue());
        if (lastPo != null && !lastPo.isEmpty()) {
            try {
                String numPart = lastPo.startsWith("PO-") ? lastPo.substring(3) : lastPo;
                long lastNum = Long.parseLong(numPart);
                if (lastNum >= nextNum) {
                    candidate = String.format("PO-%08d", lastNum + 1);
                }
            } catch (NumberFormatException ignored) {
                // fallback to count-based
            }
        }
        return candidate;
    }

    /**
     * Creates a purchase order with full financial tracking and journal entries
     * 
     * @param request   Purchase order data from client
     * @param companyId Authenticated company's ID
     *                  // * @param authorId User creating the purchase order
     * @return Persisted purchase order with calculated financials
     * @throws ResourceNotFoundException If referenced entities not found
     * @throws AccessDeniedException     If supplier doesn't belong to company
     */

    @Transactional
    // public PurchaseOrder createPurchaseOrder(PurchaseOrderRequestDto request,
    // Integer companyId, Long authorId) {
    public PurchaseOrderResponseDto createPurchaseOrder(PurchaseOrderRequestDto request, Integer companyId) {
        // Validate company existence
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Validate supplier existence and company association
        Supplier supplier = supplierRepo.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        if (!supplier.getCompany().getCompanyId().equals(companyId)) {
            throw new AccessDeniedException("Supplier does not belong to your company");
        }

        // Check for duplicate supplier invoice number
        if (request.getSupplierInvoiceNumber() != null && !request.getSupplierInvoiceNumber().trim().isEmpty()) {
            boolean invoiceExists = purchaseOrderRepo.existsByCompany_CompanyIdAndSupplier_IdAndSupplierInvoiceNumber(
                    companyId, supplier.getId(), request.getSupplierInvoiceNumber());
            if (invoiceExists) {
                throw new IllegalArgumentException(
                        "Purchase Order with this Supplier Invoice Number already exists for this supplier.");
            }
        }

        Account paymentAccount = null;
        if (request.getPaymentAccountCode() != null) {
            paymentAccount = accountRepo.findByAccountCodeAndCompany_CompanyId(
                    request.getPaymentAccountCode(), companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid payment account code"));
        }

        // Calculate totals
        // BigDecimal subtotal = calculateSubtotal(request.getItems());
        // BigDecimal total = subtotal
        // .add(request.getFreight() != null ? request.getFreight() : BigDecimal.ZERO)
        // .add(request.getTaxAmount() != null ? request.getTaxAmount() :
        // BigDecimal.ZERO);

        // Process line items and calculate financials
        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setCompany(company);
        po.setSupplierInvoiceNumber(request.getSupplierInvoiceNumber());
        po.setPoNumber(request.getPoNumber());
        po.setIssueDate(request.getIssueDate());
        po.setNotes(request.getNotes());
        po.setPaymentAccount(paymentAccount);

        processItems(request.getItems(), po, company);
        calculateFinancials(po, request.getFreight(), request.getTaxAmount());

        PurchaseOrder savedPO = purchaseOrderRepo.save(po);
        createJournalEntries(savedPO);

        if (savedPO.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            createAgingSnapshot(savedPO);
        }
        return convertToDto(savedPO);
    }

    private void createAgingSnapshot(PurchaseOrder po) {
        AgingPayableSnapshot snapshot = new AgingPayableSnapshot();
        snapshot.setCompany(po.getCompany());
        snapshot.setSupplier(po.getSupplier());
        snapshot.setPoNumber(po.getPoNumber());
        snapshot.setDueDate(po.getDueDate());
        snapshot.setBalanceDue(po.getBalanceDue());
        snapshot.setSnapshotDate(LocalDate.now());
        snapshot.computeBuckets(LocalDate.now());
        agingRepo.save(snapshot);
    }

    /**
     * Converts item DTOs to entities with account validation
     * 
     * @param items   Client-provided purchase items
     * @param po      Parent purchase order
     * @param company Associated company for account verification
     */
    private void processItems(List<PurchaseOrderItemRequestDto> items, PurchaseOrder po, Company company) {
        items.forEach(itemRequest -> {
            Account account = accountRepo.findByAccountCodeAndCompany_CompanyId(
                    itemRequest.getAccountCode(), company.getCompanyId()).orElseThrow(
                            () -> new EntityNotFoundException(
                                    "Account not found: " + itemRequest.getAccountCode()));
            Item item = itemRepository.findById(itemRequest.getItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Item not found: " + itemRequest.getItemId()));

            PurchaseOrderLineItem lineItem = new PurchaseOrderLineItem();
            lineItem.setItem(item);
            lineItem.setDescription(itemRequest.getDescription());
            lineItem.setQuantity(itemRequest.getQuantity());
            lineItem.setUnitPrice(itemRequest.getUnitPrice());
            lineItem.setDiscountPercent(itemRequest.getDiscount());
            lineItem.setAccount(account);
            lineItem.setPurchaseOrder(po);
            po.getItems().add(lineItem);
        });
    }

    /**
     * Calculates financial totals for the purchase order
     * 
     * @param po        Purchase order entity
     * @param freight   Shipping/Handling costs
     * @param taxAmount Applicable taxes
     */
    private void calculateFinancials(PurchaseOrder po, BigDecimal freight, BigDecimal taxAmount) {
        BigDecimal subtotal = po.getItems().stream()
                .map(item -> item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()))
                        .multiply(BigDecimal.ONE.subtract(item.getDiscountPercent()
                                .divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        po.setSubtotal(subtotal);
        po.setFreight(freight != null ? freight : BigDecimal.ZERO);
        po.setTaxAmount(taxAmount != null ? taxAmount : BigDecimal.ZERO);
        po.setTotal(po.getSubtotal().add(po.getFreight()).add(po.getTaxAmount()));
        po.setBalanceDue(po.getTotal());
    }

    /**
     * Creates double-entry accounting records for the purchase
     * 
     * @param po Completed purchase order with financials
     */
    private void createJournalEntries(PurchaseOrder po) {
        JournalEntryDto entryDto = new JournalEntryDto();
        entryDto.setLines(new ArrayList<>());

        // Set required fields from PurchaseOrder
        entryDto.setEntryType(JournalEntryType.PURCHASE);
        entryDto.setEntryDate(po.getIssueDate());
        // entryDto.setJournalTitle("Purchase Journal " +
        // po.getSupplierInvoiceNumber()); // Add missing journalTitle
        entryDto.setJournalTitle("Purchase Journal ");
        entryDto.setReferenceNo(po.getSupplierInvoiceNumber());
        entryDto.setCompanyId(po.getCompany().getCompanyId());
        entryDto.setDescription("Purchase order #" + po.getId()); // Add description if needed

        // 1. Debit entries for items (expenses/inventory)
        po.getItems().forEach(item -> {
            // Calculate line total with discount
            BigDecimal lineTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .multiply(BigDecimal.ONE.subtract(
                            item.getDiscountPercent()
                                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)));

            entryDto.getLines().add(new JournalEntryLineDto(
                    item.getAccount().getAccountCode(),
                    lineTotal,
                    true, // Debit
                    String.format("%s - %d units", item.getDescription(), item.getQuantity(), item.getUnitPrice())));
        });

        // 2. Debit freight (if applicable)
        if (po.getFreight().compareTo(BigDecimal.ZERO) > 0) {
            entryDto.getLines().add(new JournalEntryLineDto(
                    po.getCompany().getFreightAccount().getAccountCode(), // From Company
                    po.getFreight(),
                    true,
                    "Freight charges"));
        }

        // 3. Debit tax (if applicable)
        if (po.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
            entryDto.getLines().add(new JournalEntryLineDto(
                    po.getCompany().getTaxAccount().getAccountCode(), // From Company
                    po.getTaxAmount(),
                    true,
                    "Sales tax"));
        }

        // 4. Credit payment account if payment exists
        if (po.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            entryDto.getLines().add(new JournalEntryLineDto(
                    po.getPaymentAccount().getAccountCode(),
                    po.getAmountPaid(),
                    false, // Credit payment account
                    "Payment for PO #" + po.getId()));
        }

        // 3. Credit accounts payable for remaining balance
        if (po.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            entryDto.getLines().add(new JournalEntryLineDto(
                    po.getCompany().getAccountsPayableAccount().getAccountCode(),
                    po.getBalanceDue(),
                    false, // Credit liability
                    "Payable to " + po.getSupplier().getSupplierName()));
        }
        // Correct service call with proper DTO
        journalEntryService.createJournalEntry(entryDto);
    }

    private PurchaseOrderResponseDto convertToDto(PurchaseOrder po) {
        PurchaseOrderResponseDto dto = new PurchaseOrderResponseDto();

        // Map basic fields
        dto.setId(po.getId());
        // dto.setPurchaseOrderNumber(po.getPurchaseOrderNumber());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierName(po.getSupplier().getSupplierName());
        dto.setSupplierInvoiceNumber(po.getSupplierInvoiceNumber());
        dto.setIssueDate(po.getIssueDate());
        dto.setNotes(po.getNotes());
        dto.setSubtotal(po.getSubtotal());
        dto.setFreight(po.getFreight());
        dto.setTaxAmount(po.getTaxAmount());
        dto.setTotal(po.getTotal());
        dto.setAmountPaid(po.getAmountPaid());
        dto.setBalanceDue(po.getBalanceDue());
        dto.setPurchaseType(po.getPurchaseType());

        // Map line items
        dto.setItems(po.getItems().stream()
                .map(this::convertItemToDto)
                .collect(Collectors.toList()));

        return dto;
    }

    public List<PurchaseOrderResponseDto> getAllPurchaseOrdersByCompany(Integer companyId) {
        List<PurchaseOrder> pos = purchaseOrderRepo.findByCompany_CompanyId(companyId);
        if (pos == null)
            return List.of();
        return pos.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private PurchaseOrderItemResponseDto convertItemToDto(PurchaseOrderLineItem item) {
        PurchaseOrderItemResponseDto itemDto = new PurchaseOrderItemResponseDto();
        itemDto.setItemId(item.getItem().getItemId());
        itemDto.setItemName(item.getItem().getDescription());
        itemDto.setDescription(item.getDescription());
        itemDto.setQuantity(item.getQuantity());
        itemDto.setUnitPrice(item.getUnitPrice());
        itemDto.setDiscountPercent(item.getDiscountPercent());
        itemDto.setAmount(item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()))
                .multiply(BigDecimal.ONE.subtract(
                        item.getDiscountPercent().divide(BigDecimal.valueOf(100)))));
        itemDto.setAccountCode(item.getAccount().getAccountCode());
        itemDto.setProjectId(item.getProject() != null ? item.getProject().getId() : null);
        itemDto.setItemType(item.getItemType());

        return itemDto;
    }

    @Transactional
    public void payPurchaseOrder(Long poId, PurchasePaymentRequestDto request) {
        PurchaseOrder po = poRepo.findById(poId).orElse(null);
        if (po == null) {
            throw new EntityNotFoundException("Purchase order not found");
        }

        if (!po.getCompany().getCompanyId().equals(request.getCompanyId())) {
            throw new AccessDeniedException("Access denied to this purchase order");
        }

        if (po.getBalanceDue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Purchase order is already fully paid");
        }

        if (request.getAmount().compareTo(po.getBalanceDue()) > 0) {
            throw new IllegalArgumentException("Payment amount exceeds balance due");
        }

        Account paymentAccount = accountRepo
                .findByAccountCodeAndCompany_CompanyId(request.getPaymentAccountCode(), request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid payment account code"));

        po.setAmountPaid(po.getAmountPaid().add(request.getAmount()));
        po.setBalanceDue(po.getBalanceDue().subtract(request.getAmount()));
        PurchaseOrder savedPO = purchaseOrderRepo.save(po);

        if (savedPO.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            createAgingSnapshot(savedPO);
        }

        JournalEntryDto journal = new JournalEntryDto();
        journal.setEntryType(JournalEntryType.PAYMENT);
        journal.setEntryDate(LocalDate.now());
        journal.setJournalTitle("PO Payment");
        journal.setReferenceNo(po.getSupplierInvoiceNumber());
        journal.setCompanyId(request.getCompanyId());
        journal.setDescription("Payment for PO #" + po.getId());

        List<JournalEntryLineDto> lines = new ArrayList<>();

        lines.add(new JournalEntryLineDto(
                paymentAccount.getAccountCode(),
                request.getAmount(),
                false,
                "Payment from account for PO"));

        lines.add(new JournalEntryLineDto(
                po.getCompany().getAccountsPayableAccount().getAccountCode(),
                request.getAmount(),
                true,
                "Reduce payable for PO"));

        journal.setLines(lines);
        journalEntryService.createJournalEntry(journal);
    }
}
