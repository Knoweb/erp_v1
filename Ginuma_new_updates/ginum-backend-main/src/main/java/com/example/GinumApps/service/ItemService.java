package com.example.GinumApps.service;

import com.example.GinumApps.dto.ItemDto;
import com.example.GinumApps.model.Item;

import java.util.List;

public interface ItemService {
    Item createItem(ItemDto dto);
    List<Item> getAllItemsByCompany(Integer companyId);
    Item getItemById(Long id);
    Item updateItem(Long id, ItemDto dto);
    void deleteItem(Long id);
}
