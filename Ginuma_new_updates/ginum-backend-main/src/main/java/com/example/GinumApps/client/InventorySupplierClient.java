package com.example.GinumApps.client;

import com.example.GinumApps.dto.external.SupplierResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "inventory-service", contextId = "ginumInventorySupplierClient", fallback = InventorySupplierClientFallback.class)
public interface InventorySupplierClient {

    @GetMapping("/api/inventory/suppliers")
    List<SupplierResponseDto> getSuppliers(@RequestParam(value = "companyId", required = false) Integer companyId);

}
