# Chart of Accounts — Summary Document

Date: 2026-06-02
Source: Screenshot from application "Chart of Accounts"

## Overview
This document lists the accounts visible in the screenshot and provides concise guidance for each account, the account type, accounting treatment, sample journal entries, and month-end actions. All balances are shown using the currency label displayed (Rs.). Use this as a working reference for bookkeeping, reconciliation and mapping to your ERP's general ledger.

---

## Accounts (as shown)

| Code | Account Name | Type | Category | Balance |
|------|--------------|------|----------:|--------:|
| 1001 | knoweb       | Bank | Asset    | Rs. 10,861.89 |
| 1002 | sahan        | Bank | Asset    | Rs. 98,011.29 |
| 1003 | kamal        | Account Receivable | Asset | Rs. 80,000.00 |
| 2001 | wawili       | Accounts Payable | Liability | Rs. 65,982.53 |
| 4001 | nimal        | Income | Income | Rs. 122,350.00 |
| 5001 | sannota      | Expense | Expense | Rs. 179,459.35 |

Total accounts shown: 6

---

## Brief description & recommended actions (by account)

- Code 1001 — `knoweb` (Bank / Asset)
  - Description: Bank account (likely a company bank account). Balance indicates cash at bank.
  - Recommended actions: Reconcile with bank statement monthly; ensure bank charges and interest are posted; verify opening balance and clearing items.
  - Typical transactions: Customer receipts, transfers, supplier payments.
  - Sample journal (receive cash): Dr Bank 10,000 / Cr Sales 10,000

- Code 1002 — `sahan` (Bank / Asset)
  - Description: Another bank account (could be separate branch or petty bank). Treat same as other banks.
  - Recommended actions: Maintain separate reconciliation and sign-off; track transfers between bank accounts.

- Code 1003 — `kamal` (Accounts Receivable / Asset)
  - Description: Customer receivable ledger (outstanding amounts due from customers). Balance likely represents unpaid invoices.
  - Recommended actions: Age receivables, follow up overdue customers, provision for doubtful debts if needed.
  - Typical transactions: Invoice issuance (Dr Accounts Receivable / Cr Sales), receipt (Dr Bank / Cr Accounts Receivable).
  - Sample journal (issue invoice): Dr Accounts Receivable 80,000 / Cr Sales 80,000

- Code 2001 — `wawili` (Accounts Payable / Liability)
  - Description: Supplier/vendor payable ledger (amounts you owe). Balance is likely outstanding supplier invoices.
  - Recommended actions: Reconcile supplier statements, plan payments according to due dates, account for withheld taxes if applicable.
  - Sample journal (supplier invoice): Dr Expense or Purchase 65,982.53 / Cr Accounts Payable 65,982.53

- Code 4001 — `nimal` (Income / Income)
  - Description: Revenue or income account (sales revenue). Confirm whether this is a specific revenue stream.
  - Recommended actions: Ensure revenue is recognized in the correct period; apply tax/VAT rules where necessary.
  - Sample journal (record sales): Dr Accounts Receivable / Cr Income 122,350.00

- Code 5001 — `sannota` (Expense / Expense)
  - Description: Expense account. Confirm what expense category this maps to (e.g., office expenses, COGS, utilities).
  - Recommended actions: Check supporting receipts; capitalize or expense based on policy; ensure tax-deductible items are tracked.
  - Sample journal (record expense): Dr Expense 179,459.35 / Cr Bank 179,459.35

---

## Account type definitions (quick reference)
- Asset: Economic resources controlled by the company (cash, receivables, inventory). Normal debit balance.
- Liability: Obligations to third parties (payables, loans). Normal credit balance.
- Income (Revenue): Earnings from core operations (sales). Normal credit balance.
- Expense: Costs incurred (utilities, salaries). Normal debit balance.

---

## Month-end checklist (recommended)
- Reconcile all `Bank` accounts (1001, 1002) with bank statements; clear reconciling items.
- Reconcile `Accounts Receivable` (1003) with customer statements; produce AR ageing report.
- Reconcile `Accounts Payable` (2001) with supplier statements; schedule payments and accruals.
- Review `Income` (4001) for revenue cutoff errors; confirm tax/VAT treatment.
- Review `Expense` (5001) for mis-posted items and accruals; reclassify if necessary.
- Run trial balance and ensure debits = credits.
- Prepare adjusting entries for depreciation, accruals, prepayments, provisions.

---

## Journal entry examples
- Cash sales (immediate receipt):
  - Dr Bank (1001 or 1002)
  - Cr Income (4001)

- Credit sale (invoice to customer):
  - Dr Accounts Receivable (1003)
  - Cr Income (4001)

- Supplier invoice (on credit):
  - Dr Expense or Inventory
  - Cr Accounts Payable (2001)

- Supplier payment:
  - Dr Accounts Payable (2001)
  - Cr Bank (1001 or 1002)

---

## Recommended mappings & naming suggestions
- Consider renaming account descriptions to clearer names (e.g., `1001 - Bank - Main Account (Knoweb)`), and add a `description` field in ERP for GL notes.
- Use consistent numbering convention: Assets (1000-1999), Liabilities (2000-2999), Equity (3000-3999), Income (4000-4999), Expenses (5000-5999).
- Tag accounts with `department`, `cost center`, or `tax code` fields if ERP supports it.

---

## Next steps
- Confirm each account's exact purpose and owner (who manages the account in operations).
- If you want, I can:
  - Produce a downloadable PDF of this document and place it in the repo.
  - Generate CSV import mapping for your ERP (code, name, type, opening balance).
  - Create reconciliation templates (Excel/CSV) for bank and AR/AP.

Tell me which of the next steps you want me to do.

---

Prepared by: Engineering / Finance automation assistant

