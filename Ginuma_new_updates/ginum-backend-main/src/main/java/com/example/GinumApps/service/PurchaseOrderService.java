package com.example.GinumApps.service;

import com.example.GinumApps.dto.*;
import com.example.GinumApps.enums.JournalEntryType;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.model.*;
import com.example.GinumApps.enums.*;
import com.example.GinumApps.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    public String getNextSupplierInvoiceNumber(Integer companyId) {
        long count = purchaseOrderRepo.countByCompanyId(companyId.longValue());
        long nextNum = count + 1;

        String candidate = String.format("INV-%08d", nextNum);
        String lastInv = purchaseOrderRepo.findLastSupplierInvoiceNumberByCompanyId(companyId.longValue());
        if (lastInv != null && !lastInv.isEmpty()) {
            try {
                String numPart = lastInv.startsWith("INV-") ? lastInv.substring(4) : lastInv;
                long lastNum = Long.parseLong(numPart);
                if (lastNum >= nextNum) {
                    candidate = String.format("INV-%08d", lastNum + 1);
                }
            } catch (NumberFormatException ignored) {
                // fallback
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
        po.setTaxPercent(request.getTaxPercent());
        po.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : BigDecimal.ZERO);
        po.setDueDate(request.getDueDate());
        po.setPurchaseType(request.getPurchaseType());

        processItems(request.getItems(), po, company);
        calculateFinancials(po, request.getFreight(), request.getTaxAmount());
        validateCompanyAccounts(company, po);

        PurchaseOrder savedPO = purchaseOrderRepo.save(po);
        createJournalEntries(savedPO);

        if (savedPO.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            createAgingSnapshot(savedPO);
        }
        return convertToDto(savedPO);
    }

    private void createAgingSnapshot(PurchaseOrder po) {
        AgingPayableSnapshot snapshot = agingRepo
            .findByCompany_CompanyIdAndPoNumber(po.getCompany().getCompanyId(), po.getPoNumber())
            .orElse(new AgingPayableSnapshot());

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
            Item item = null;
            if (itemRequest.getItemId() != null) {
                item = itemRepository.findById(itemRequest.getItemId())
                        .orElseThrow(() -> new EntityNotFoundException("Item not found: " + itemRequest.getItemId()));
            }

            PurchaseOrderLineItem lineItem = new PurchaseOrderLineItem();
            lineItem.setItem(item);
            lineItem.setDescription(itemRequest.getDescription());
            lineItem.setQuantity(itemRequest.getQuantity());
            lineItem.setUnitPrice(itemRequest.getUnitPrice());
            lineItem.setDiscountPercent(itemRequest.getDiscount());
            lineItem.setAccount(account);
            lineItem.setPurchaseOrder(po);
            lineItem.setItemType(itemRequest.getItemType());
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
                .map(item -> {
                    BigDecimal base = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal discount = base.multiply(item.getDiscountPercent()
                            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                    BigDecimal lineAmount = base.subtract(discount);
                    item.setAmount(lineAmount); // Enforce consistency
                    return lineAmount;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        po.setSubtotal(subtotal);
        po.setFreight(freight != null ? freight : BigDecimal.ZERO);
        
        BigDecimal subtotalPlusFreight = subtotal.add(po.getFreight());
        po.setTaxAmount(subtotalPlusFreight.multiply(po.getTaxPercent() != null ? po.getTaxPercent() : BigDecimal.ZERO)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        
        po.setTotal(subtotalPlusFreight.add(po.getTaxAmount()));
        po.setBalanceDue(po.getTotal().subtract(po.getAmountPaid() != null ? po.getAmountPaid() : BigDecimal.ZERO));
    }

    private void validateCompanyAccounts(Company company, PurchaseOrder po) {
        if (po.getBalanceDue().compareTo(BigDecimal.ZERO) > 0 && getAccountsPayableAccount(company) == null) {
            throw new IllegalStateException("Accounts Payable account (code 2100) is not configured for this company. Please ensure it exists in your Chart of Accounts.");
        }
        if (po.getTaxAmount().compareTo(BigDecimal.ZERO) > 0 && getTaxAccount(company) == null) {
            throw new IllegalStateException("Sales Tax account (code 5200) is not configured for this company. Please ensure it exists in your Chart of Accounts.");
        }
        if (po.getFreight().compareTo(BigDecimal.ZERO) > 0 && getFreightAccount(company) == null) {
            throw new IllegalStateException("Freight Expense account (code 5100) is not configured for this company. Please ensure it exists in your Chart of Accounts.");
        }
        if (po.getAmountPaid().compareTo(BigDecimal.ZERO) > 0 && po.getPaymentAccount() == null) {
            throw new IllegalArgumentException("Payment account is required when amount paid is greater than zero.");
        }
    }

    private Account getAccountsPayableAccount(Company company) {
        if (company.getAccountsPayableAccount() != null) return company.getAccountsPayableAccount();
        // Fallback 1: Try code 2100
        Optional<Account> byCode = accountRepo.findByAccountCodeAndCompany_CompanyId(Company.PAYABLE_ACCOUNT_CODE, company.getCompanyId());
        if (byCode.isPresent()) return byCode.get();
        // Fallback 2: Try any account of type LIABILITY_ACCOUNTS_PAYABLE
        return accountRepo.findFirstByAccountTypeAndCompany_CompanyId(AccountType.LIABILITY_ACCOUNTS_PAYABLE, company.getCompanyId()).orElse(null);
    }

    private Account getTaxAccount(Company company) {
        if (company.getTaxAccount() != null) return company.getTaxAccount();
        // Fallback 1: Try code 5200
        Optional<Account> byCode = accountRepo.findByAccountCodeAndCompany_CompanyId(Company.TAX_ACCOUNT_CODE, company.getCompanyId());
        if (byCode.isPresent()) return byCode.get();
        // Fallback 2: Try by name "Sales Tax" (Normalized)
        Optional<Account> byName = accountRepo.findFirstByNormalizedNameAndCompany_CompanyId("SALESTAX", company.getCompanyId());
        if (byName.isPresent()) return byName.get();
        // Fallback 3: Try any Expense account
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
            Account freightAcc = getFreightAccount(po.getCompany());
            entryDto.getLines().add(new JournalEntryLineDto(
                    freightAcc.getAccountCode(), // From smart lookup
                    po.getFreight(),
                    true, // Debit
                    "Freight Charges"));
        }

        // 3. Debit tax (if applicable)
        if (po.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
            Account taxAcc = getTaxAccount(po.getCompany());
            entryDto.getLines().add(new JournalEntryLineDto(
                    taxAcc.getAccountCode(), // From smart lookup
                    po.getTaxAmount(),
                    true, // Debit
                    "Sales Tax on Purchase"));
        }

        // 4. Credit payment account if paid (CASH/BANK)
        if (po.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            entryDto.getLines().add(new JournalEntryLineDto(
                    po.getPaymentAccount().getAccountCode(),
                    po.getAmountPaid(),
                    false, // Credit Asset
                    "Payment for Purchase"));
        }

        // 5. Credit accounts payable for balance
        if (po.getBalanceDue().compareTo(BigDecimal.ZERO) > 0) {
            Account payableAcc = getAccountsPayableAccount(po.getCompany());
            entryDto.getLines().add(new JournalEntryLineDto(
                    payableAcc.getAccountCode(), // From smart lookup
                    po.getBalanceDue(),
                    false, // Credit Liability
                    "Accounts Payable to " + po.getSupplier().getSupplierName()));
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
        dto.setTaxPercent(po.getTaxPercent());
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
        if (item.getItem() != null) {
            itemDto.setItemId(item.getItem().getItemId());
            itemDto.setItemName(item.getItem().getDescription());
        }
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
        } else {
            agingRepo.findByCompany_CompanyIdAndPoNumber(request.getCompanyId(), po.getPoNumber())
                .ifPresent(agingRepo::delete);
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
