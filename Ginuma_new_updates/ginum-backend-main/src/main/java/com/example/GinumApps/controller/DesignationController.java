package com.example.GinumApps.controller;

import com.example.GinumApps.dto.DesignationDto;
import com.example.GinumApps.model.Department;
import com.example.GinumApps.model.Designation;
import com.example.GinumApps.service.DesignationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/{companyId}/designations")
@RequiredArgsConstructor
public class DesignationController {
    private final DesignationService designationService;

    @PostMapping
    public ResponseEntity<Designation> createDesignation(
            @PathVariable Integer companyId,
            @RequestBody DesignationDto designationDto) {
        return ResponseEntity.ok(designationService.createDesignation(companyId, designationDto));
    }

    @GetMapping
    public ResponseEntity<List<Designation>> getAllDesignationsByCompanyId(
            @PathVariable Integer companyId) {
        return ResponseEntity.ok(designationService.getAllDesignationsByCompanyId(companyId));
    }

    @GetMapping("/by-department/{departmentCode}")
    public ResponseEntity<List<Designation>> getDesignationsByDepartmentCode(
            @PathVariable Integer companyId,
            @PathVariable String departmentCode) {

        List<Designation> designations = designationService.getDesignationsByDepartmentCode(companyId, departmentCode);
        if (designations == null) {
            return ResponseEntity.notFound().build();
        }
        if (designations.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(designations);
    }

    @PutMapping("/{designationId}")
    public ResponseEntity<Designation> updateDesignation(
            @PathVariable Integer companyId,
            @PathVariable Integer designationId,
            @RequestBody DesignationDto designationDto) {
        return ResponseEntity.ok(designationService.updateDesignation(companyId, designationId, designationDto));
    }

    @DeleteMapping("/{designationId}")
    public ResponseEntity<String> deleteDesignation(
            @PathVariable Integer companyId,
            @PathVariable Integer designationId) {
        designationService.deleteDesignation(companyId, designationId);
        return ResponseEntity.ok("Designation deleted successfully");
    }
}
