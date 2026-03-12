package com.example.GinumApps.controller;

import com.example.GinumApps.dto.DepartmentDto;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Department;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/{companyId}/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService departmentService;
    private final CompanyRepository companyRepository;

    @PostMapping
    public ResponseEntity<Department> createDepartment(@PathVariable Integer companyId,
            @RequestBody DepartmentDto departmentDto) {
        return ResponseEntity.ok(departmentService.createDepartment(companyId, departmentDto));
    }

    @GetMapping
    public ResponseEntity<List<Department>> getDepartmentsByCompanyId(
            @PathVariable Integer companyId) {

        return ResponseEntity.ok(departmentService.getDepartmentsByCompanyId(companyId));
    }

    @PutMapping("/{departmentId}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Integer companyId,
            @PathVariable Integer departmentId,
            @RequestBody DepartmentDto departmentDto) {
        return ResponseEntity.ok(departmentService.updateDepartment(companyId, departmentId, departmentDto));
    }

    @DeleteMapping("/{departmentId}")
    public ResponseEntity<String> deleteDepartment(
            @PathVariable Integer companyId,
            @PathVariable Integer departmentId) {
        departmentService.deleteDepartment(companyId, departmentId);
        return ResponseEntity.ok("Department deleted successfully");
    }
}