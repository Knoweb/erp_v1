package com.example.GinumApps.controller;

import com.example.GinumApps.dto.EmployeeRequestDto;
import com.example.GinumApps.model.Employee;
import com.example.GinumApps.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees/{companyId}")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@PathVariable Integer companyId,
            @Valid @RequestBody EmployeeRequestDto request) {
        Employee createdEmployee = employeeService.createEmployee(request, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployee);
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getEmployeeByCompany(@PathVariable Integer companyId) {
        return ResponseEntity.ok(employeeService.getEmployeesByCompany(companyId));
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Integer companyId,
            @PathVariable Integer employeeId,
            @Valid @RequestBody EmployeeRequestDto request) {
        return ResponseEntity.ok(employeeService.updateEmployee(companyId, employeeId, request));
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Integer companyId,
            @PathVariable Integer employeeId) {
        employeeService.deleteEmployee(companyId, employeeId);
        return ResponseEntity.ok("Employee deleted successfully");
    }
}