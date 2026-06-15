package com.inventory.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class PurchaseReceiveRequestDto {
    private List<ReceiveItem> items;

    @Data
    public static class ReceiveItem {
        private Long itemId;
        private Integer quantity;
    }
}
