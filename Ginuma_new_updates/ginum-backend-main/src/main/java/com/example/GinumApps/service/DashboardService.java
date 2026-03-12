package com.example.GinumApps.service;

import com.example.GinumApps.dto.DashboardStatsDto;

public interface DashboardService {
    DashboardStatsDto getCompanyDashboardStats(Integer companyId);
}
