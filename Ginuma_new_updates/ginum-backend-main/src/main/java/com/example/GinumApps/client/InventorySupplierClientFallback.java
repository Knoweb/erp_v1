package com.example.GinumApps.client;

import com.example.GinumApps.dto.external.SupplierResponseDto;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class InventorySupplierClientFallback implements InventorySupplierClient {

    @Override
    public List<SupplierResponseDto> getSuppliers(Integer companyId) {
        return Collections.emptyList();
    }
}
