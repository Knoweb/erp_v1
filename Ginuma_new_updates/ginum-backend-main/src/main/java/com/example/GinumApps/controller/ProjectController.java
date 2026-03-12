package com.example.GinumApps.controller;

import com.example.GinumApps.dto.ProjectSummaryDto;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Customer;
import com.example.GinumApps.model.Project;
import com.example.GinumApps.enums.WorkingStatus;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.CustomerRepository;
import com.example.GinumApps.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies/{companyId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final CustomerRepository customerRepository;

    // === GET: Auto-generate next project code ===
    @GetMapping("/next-code")
    public ResponseEntity<Map<String, String>> getNextProjectCode(@PathVariable Integer companyId) {
        long count = projectRepository.countByCompanyId(companyId);
        long nextNum = count + 1;
        String nextCode = String.format("PRJ-%05d", nextNum);
        Map<String, String> response = new HashMap<>();
        response.put("code", nextCode);
        return ResponseEntity.ok(response);
    }

    // === GET: All projects for a company ===
    @GetMapping
    public ResponseEntity<List<ProjectSummaryDto>> getProjectsByCompany(@PathVariable Integer companyId) {
        List<Project> projects = projectRepository.findByCompany_CompanyId(companyId);
        List<ProjectSummaryDto> dtoList = projects.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    // === POST: Create a new project ===
    @PostMapping
    public ResponseEntity<?> createProject(
            @PathVariable Integer companyId,
            @RequestBody ProjectSummaryDto request) {

        // Validate company
        Company company = companyRepository.findById(companyId).orElse(null);
        if (company == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Company not found"));
        }

        // Check duplicate project code within same company
        if (request.getCode() != null
                && projectRepository.existsByCodeAndCompany_CompanyId(request.getCode(), companyId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Project code '" + request.getCode() + "' already exists for this company."));
        }

        // Validate customer if provided
        Customer customer = resolveCustomer(request.getCustomerId(), companyId);

        // Build and save project
        Project project = buildProject(request, company, customer);
        Project saved = projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    // === PUT: Update an existing project ===
    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable Integer companyId,
            @PathVariable Long projectId,
            @RequestBody ProjectSummaryDto request) {

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Project not found"));
        }
        if (!project.getCompany().getCompanyId().equals(companyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
        }

        Customer customer = resolveCustomer(request.getCustomerId(), companyId);

        project.setName(request.getName());
        project.setStartDate(request.getStartDate());
        project.setDescription(request.getDescription());
        project.setPriority(request.getPriority());
        project.setCustomer(customer);
        if (request.getTotalCost() != null)
            project.setTotalCost(request.getTotalCost());
        if (request.getWorkingStatus() != null) {
            try {
                project.setWorkingStatus(WorkingStatus.valueOf(request.getWorkingStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }

        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(toDto(saved));
    }

    // === DELETE: Remove a project ===
    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Integer companyId,
            @PathVariable Long projectId) {

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Project not found"));
        }
        if (!project.getCompany().getCompanyId().equals(companyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
        }

        projectRepository.delete(project);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }

    // === Helper: Resolve customer by ID ===
    private Customer resolveCustomer(Long customerId, Integer companyId) {
        if (customerId == null)
            return null;
        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer != null && !customer.getCompany().getCompanyId().equals(companyId))
            return null;
        return customer;
    }

    // === Helper: Build project entity from DTO ===
    private Project buildProject(ProjectSummaryDto request, Company company, Customer customer) {
        Project project = new Project();
        project.setCode(request.getCode());
        project.setName(request.getName());
        project.setStartDate(request.getStartDate());
        project.setDescription(request.getDescription());
        project.setPriority(request.getPriority());
        project.setCompany(company);
        project.setCustomer(customer);
        if (request.getWorkingStatus() != null) {
            try {
                project.setWorkingStatus(WorkingStatus.valueOf(request.getWorkingStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                project.setWorkingStatus(WorkingStatus.ACTIVE);
            }
        }
        if (request.getTotalCost() != null)
            project.setTotalCost(request.getTotalCost());
        return project;
    }

    // === Helper: Convert Project entity → DTO ===
    private ProjectSummaryDto toDto(Project p) {
        return ProjectSummaryDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .startDate(p.getStartDate())
                .description(p.getDescription())
                .priority(p.getPriority())
                .workingStatus(p.getWorkingStatus() != null ? p.getWorkingStatus().name() : null)
                .customerId(p.getCustomer() != null ? p.getCustomer().getId() : null)
                .customerName(p.getCustomer() != null ? p.getCustomer().getName() : null)
                .totalCost(p.getTotalCost())
                .build();
    }
}
