package com.example.GinumApps.client;

import com.example.GinumApps.dto.external.ItemResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @GetMapping("/api/inventory/items/{id}")
    ItemResponseDto getItemById(@PathVariable("id") String id);

}
