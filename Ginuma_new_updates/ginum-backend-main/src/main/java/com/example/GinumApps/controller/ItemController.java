package com.example.GinumApps.controller;

import com.example.GinumApps.dto.ItemDto;
import com.example.GinumApps.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createItem(
            @PathVariable Integer companyId,
            @RequestBody @Valid ItemDto itemDto) {
        itemService.createItem(companyId, itemDto);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Item created successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ItemDto>> getItems(@PathVariable Integer companyId) {
        return ResponseEntity.ok(itemService.getItemsByCompany(companyId));
    }
}

