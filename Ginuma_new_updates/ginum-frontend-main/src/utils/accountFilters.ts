export enum AccountContext {
  SALES_ITEM_ACCOUNT = "SALES_ITEM_ACCOUNT",
  SALES_PAYMENT_ACCOUNT = "SALES_PAYMENT_ACCOUNT",
  PURCHASE_ITEM_ACCOUNT = "PURCHASE_ITEM_ACCOUNT",
  PURCHASE_PAYMENT_ACCOUNT = "PURCHASE_PAYMENT_ACCOUNT",
}

export interface Account {
  id: string | number;
  accountName: string;
  accountCode: string;
  category?: string;    // 'Asset', 'Liability', 'Income', 'Expense'
  type?: string;        // 'Bank', 'Fixed Asset', 'Credit Card', 'Cash'
  accountType?: string; // e.g., 'ASSET_BANK' (legacy/backend format)
  [key: string]: any;
}

/**
 * Normalizes backend account data into the strict category/type format.
 */
const normalizeAccount = (acc: Account): { category: string; type: string } => {
  // If explicitly provided by backend
  if (acc.category && acc.type) {
    return { category: acc.category.toLowerCase(), type: acc.type.toLowerCase() };
  }

  // Fallback: Parse from accountType (e.g., ASSET_BANK -> category: Asset, type: Bank)
  const rawType = (acc.accountType || "").toUpperCase();
  
  if (rawType.startsWith("ASSET_")) {
    return { category: "asset", type: rawType.replace("ASSET_", "").toLowerCase() };
  }
  if (rawType.startsWith("LIABILITY_")) {
    return { category: "liability", type: rawType.replace("LIABILITY_", "").toLowerCase() };
  }
  if (rawType === "EQUITY") return { category: "equity", type: "equity" };
  if (rawType === "INCOME" || rawType === "OTHER_INCOME") return { category: "income", type: rawType.toLowerCase() };
  if (rawType === "EXPENSE" || rawType === "OTHER_EXPENSE") return { category: "expense", type: rawType.toLowerCase() };
  if (rawType === "COST_OF_SALES" || rawType === "COST_OF_SALE") return { category: "cost of sale", type: "cost of sale" };

  return { category: "unknown", type: "unknown" };
};

/**
 * Robust utility to filter accounts based on strict accounting rules for UI dropdowns.
 * 
 * @param accounts - Raw array of account objects fetched from the backend.
 * @param context - The specific UI context where the dropdown is used.
 * @returns Filtered array of accounts strictly matching the accounting context.
 */
export const filterAccountsByContext = (
  accounts: Account[],
  context: AccountContext | string
): Account[] => {
  if (!Array.isArray(accounts)) return [];

  return accounts.filter((account) => {
    const { category, type } = normalizeAccount(account);

    switch (context) {
      /**
       * 1. SALES_ITEM_ACCOUNT (Line items in a Sales Order)
       * Rule: Only revenue-generating accounts.
       */
      case AccountContext.SALES_ITEM_ACCOUNT:
        return ["income", "other income"].includes(category);

      /**
       * 2. SALES_PAYMENT_ACCOUNT (Payment receiving account)
       * Rule: Only liquid asset accounts where money can be deposited.
       */
      case AccountContext.SALES_PAYMENT_ACCOUNT:
        return category === "asset" && ["bank", "cash"].includes(type);

      /**
       * 3. PURCHASE_ITEM_ACCOUNT (Line items in a Purchase Order)
       * Rule: Typically expenses or cost of sales.
       * Exception: Capital expenditures (Fixed Assets) are allowed for purchase.
       */
      case AccountContext.PURCHASE_ITEM_ACCOUNT:
        const isExpense = ["expense", "other expense", "cost of sale", "cost of sales"].includes(category);
        const isFixedAsset = category === "asset" && type === "fixed asset";
        return isExpense || isFixedAsset;

      /**
       * 4. PURCHASE_PAYMENT_ACCOUNT (Payment making account)
       * Rule: Liquid assets (Bank/Cash) or specific liabilities used for credit (Credit Card).
       */
      case AccountContext.PURCHASE_PAYMENT_ACCOUNT:
        const isLiquidAsset = category === "asset" && ["bank", "cash"].includes(type);
        const isCreditCard = category === "liability" && type === "credit card";
        return isLiquidAsset || isCreditCard;

      default:
        // By default, if context is unknown, return no accounts to be safe (strict mode)
        console.warn(`Unknown AccountContext provided: ${context}`);
        return false;
    }
  });
};

/**
 * Example Usage for Ginum Apps ERP:
 * 
 * const salesAccounts = filterAccountsByContext(allAccounts, AccountContext.SALES_ITEM_ACCOUNT);
 * const bankAccounts = filterAccountsByContext(allAccounts, AccountContext.SALES_PAYMENT_ACCOUNT);
 */
