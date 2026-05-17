package com.example.GinumApps.client;

import com.example.GinumApps.dto.external.ItemResponseDto;
import com.example.GinumApps.dto.external.InventoryPoResponseDto;
import com.example.GinumApps.dto.external.SupplierResponseDto;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class InventoryClientFallback implements InventoryClient {

    @Override
    public ItemResponseDto getItemById(String id) {
        return null;
    }

    @Override
    public List<SupplierResponseDto> getSuppliers(Integer companyId) {
        return Collections.emptyList();
    }

    @Override
    public List<InventoryPoResponseDto> getApprovedPurchaseOrdersBySupplierId(Long supplierId, String status) {
        return Collections.emptyList();
    }
}