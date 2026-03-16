package com.example.GinumApps.service;

import com.example.GinumApps.dto.ItemDto;
import com.example.GinumApps.model.Account;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Item;
import com.example.GinumApps.repository.AccountRepository;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepo;
    private final AccountRepository accountRepo;
    private final CompanyRepository companyRepo;

    @Override
    @Transactional
    public Item createItem(ItemDto dto) {
        Company company = companyRepo.findById(dto.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));

        Item item = new Item();
        mapDtoToEntity(dto, item, company);
        return itemRepo.save(item);
    }

    @Override
    public List<Item> getAllItemsByCompany(Integer companyId) {
        return itemRepo.findByCompany_CompanyId(companyId);
    }

    @Override
    public Item getItemById(Long id) {
        return itemRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));
    }

    @Override
    @Transactional
    public Item updateItem(Long id, ItemDto dto) {
        Item existing = getItemById(id);
        mapDtoToEntity(dto, existing, existing.getCompany());
        return itemRepo.save(existing);
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepo.existsById(id)) {
            throw new EntityNotFoundException("Item not found");
        }
        itemRepo.deleteById(id);
    }

    private void mapDtoToEntity(ItemDto dto, Item item, Company company) {
        item.setItemCode(dto.getItemCode());
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setSalesPrice(dto.getSalesPrice());
        item.setPurchasePrice(dto.getPurchasePrice());
        item.setCompany(company);
        item.setActive(dto.isActive());

        if (dto.getIncomeAccountId() != null) {
            Account incomeAcc = accountRepo.findById(dto.getIncomeAccountId())
                    .orElseThrow(() -> new EntityNotFoundException("Income account not found"));
            item.setIncomeAccount(incomeAcc);
        }

        if (dto.getExpenseAccountId() != null) {
            Account expenseAcc = accountRepo.findById(dto.getExpenseAccountId())
                    .orElseThrow(() -> new EntityNotFoundException("Expense account not found"));
            item.setExpenseAccount(expenseAcc);
        }
    }
}
