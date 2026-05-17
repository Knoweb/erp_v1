package com.example.GinumApps.client;

import com.example.GinumApps.dto.external.EmployeeResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "hr-service")
public interface HrClient {

    @GetMapping("/api/employees/{id}")
    EmployeeResponseDto getEmployeeById(@PathVariable("id") String id);

}
