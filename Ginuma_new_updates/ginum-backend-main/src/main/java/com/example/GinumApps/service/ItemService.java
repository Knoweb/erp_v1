package com.example.GinumApps.service;

import com.example.GinumApps.dto.ItemDto;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Item;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.ItemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public Item createItem(Integer companyId, ItemDto itemDto) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Item item = new Item();
        item.setCompany(company);
        item.setName(itemDto.getName());
        item.setDescription(itemDto.getDescription());
        item.setUnitPrice(itemDto.getUnitPrice());
        item.setUnit(itemDto.getUnit());

        return itemRepository.save(item);
    }

    public List<ItemDto> getItemsByCompany(Integer companyId) {
        List<Item> items = itemRepository.findByCompany_CompanyId(companyId);
        return items.stream().map(this::toDto).collect(Collectors.toList());
    }

    private ItemDto toDto(Item item) {
        return ItemDto.builder()
                .id(item.getItemId())
                .name(item.getName())
                .description(item.getDescription())
                .unitPrice(item.getUnitPrice())
                .unit(item.getUnit())
                .build();
    }
}
