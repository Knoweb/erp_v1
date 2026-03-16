package com.example.GinumApps.controller;

import com.example.GinumApps.dto.ItemDto;
import com.example.GinumApps.model.Item;
import com.example.GinumApps.service.ItemService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<?> createItem(@PathVariable Integer companyId, @RequestBody ItemDto dto) {
        try {
            dto.setCompanyId(companyId);
            Item created = itemService.createItem(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create item"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(@PathVariable Integer companyId) {
        return ResponseEntity.ok(itemService.getAllItemsByCompany(companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Integer companyId, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(itemService.getItemById(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Integer companyId, @PathVariable Long id, @RequestBody ItemDto dto) {
        try {
            dto.setCompanyId(companyId);
            return ResponseEntity.ok(itemService.updateItem(id, dto));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Integer companyId, @PathVariable Long id) {
        try {
            itemService.deleteItem(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }
}
