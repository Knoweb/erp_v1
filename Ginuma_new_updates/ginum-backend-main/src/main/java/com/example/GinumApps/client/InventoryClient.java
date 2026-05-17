package com.example.GinumApps.client;

import com.example.GinumApps.dto.external.ItemResponseDto;
import com.example.GinumApps.dto.external.SupplierResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "inventory-service", contextId = "ginumInventoryClient", fallback = InventoryClientFallback.class)
public interface InventoryClient {

    @GetMapping("/api/inventory/items/{id}")
    ItemResponseDto getItemById(@PathVariable("id") String id);

    @GetMapping("/api/inventory/suppliers")
    List<SupplierResponseDto> getSuppliers(@RequestParam(value = "companyId", required = false) Integer companyId);

}
