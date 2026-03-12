package com.example.GinumApps.controller;

import com.example.GinumApps.dto.DashboardStatsDto;
import com.example.GinumApps.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies/{companyId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getCompanyDashboardStats(@PathVariable Integer companyId) {
        DashboardStatsDto stats = dashboardService.getCompanyDashboardStats(companyId);
        return ResponseEntity.ok(stats);
    }
}
