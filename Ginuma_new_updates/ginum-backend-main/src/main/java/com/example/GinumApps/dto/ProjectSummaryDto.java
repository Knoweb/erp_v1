package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryDto {
    private Long id;
    private String code;
    private String name;
    private String startDate;
    private String description;
    private String priority;
    private String workingStatus;
    private Long customerId;
    private String customerName;
    private Long totalCost;
}
