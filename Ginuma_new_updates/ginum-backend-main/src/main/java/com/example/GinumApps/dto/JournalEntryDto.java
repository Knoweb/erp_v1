package com.example.GinumApps.dto;

import com.example.GinumApps.enums.JournalEntryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntryDto {
    private JournalEntryType entryType;
    private LocalDate entryDate;
    private String journalTitle;
    private String referenceNo;
    private Integer authorId;
    private String description;
    private Integer companyId;

    private List<JournalEntryLineDto> lines;

}

