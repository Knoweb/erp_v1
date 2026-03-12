package com.example.GinumApps.controller;

import com.example.GinumApps.model.AgingPayableSnapshot;
import com.example.GinumApps.repository.AgingPayableSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies/{companyId}/aged-payables")
@RequiredArgsConstructor
public class AgedPayablesController {

    private final AgingPayableSnapshotRepository agingRepo;

    @GetMapping
    public ResponseEntity<List<AgingPayableSnapshot>> getAgedPayablesByCompany(@PathVariable Integer companyId) {
        return ResponseEntity.ok(agingRepo.findByCompany_CompanyId(companyId));
    }
}
