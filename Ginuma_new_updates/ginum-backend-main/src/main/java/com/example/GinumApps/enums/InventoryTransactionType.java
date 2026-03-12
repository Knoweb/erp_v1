package com.example.GinumApps.enums;

public enum InventoryTransactionType {
    STOCK_IN,        // Receiving stock/purchase
    STOCK_OUT,       // Sales/consumption
    ADJUSTMENT,      // Manual adjustments
    TRANSFER,        // Warehouse transfers
    RETURN          // Returns from customers/to suppliers
}
