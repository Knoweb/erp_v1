package com.example.GinumApps.service;

import com.example.GinumApps.client.InventoryClient;
import com.example.GinumApps.dto.external.ItemResponseDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class InvoiceServiceExample {

    private final InventoryClient inventoryClient;

    public InvoiceServiceExample(InventoryClient inventoryClient) {
        this.inventoryClient = inventoryClient;
    }

    /**
     * Example method that fetches item details from inventory-service synchronously
     * and uses the price to calculate an invoice line total.
     */
    public BigDecimal calculateLineTotal(String externalItemId, int quantity) {
        ItemResponseDto item = inventoryClient.getItemById(externalItemId);
        if (item == null || item.getPrice() == null) {
            throw new IllegalStateException("Item or price not available for id=" + externalItemId);
        }
        return item.getPrice().multiply(BigDecimal.valueOf(quantity));
    }
}
