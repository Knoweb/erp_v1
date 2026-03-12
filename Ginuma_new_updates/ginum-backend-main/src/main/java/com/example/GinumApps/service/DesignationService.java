package com.example.GinumApps.service;

import com.example.GinumApps.dto.DesignationDto;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Department;
import com.example.GinumApps.model.Designation;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.DepartmentRepository;
import com.example.GinumApps.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignationService {
    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;

    public Designation createDesignation(Integer companyId, DesignationDto designationDto) {
        // Verify company exists
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Find department by company ID and code
        Department department = departmentRepository
                .findByCompany_CompanyIdAndCode(companyId, designationDto.getDepartmentCode())
                .orElseThrow(() -> new RuntimeException(
                        "Department not found with code: " + designationDto.getDepartmentCode()));

        // Create and save designation
        Designation designation = new Designation();
        designation.setName(designationDto.getName());
        designation.setDepartment(department);
        return designationRepository.save(designation);
    }

    public List<Designation> getDesignationsByDepartmentCode(Integer companyId, String departmentCode) {
        Department department = departmentRepository.findByCompany_CompanyIdAndCode(companyId, departmentCode)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        return designationRepository.findByDepartment_Id(department.getId());
    }

    public List<Designation> getAllDesignationsByCompanyId(Integer companyId) {
        return designationRepository.findByDepartment_Company_CompanyId(companyId);
    }

    public Designation updateDesignation(Integer companyId, Integer designationId, DesignationDto designationDto) {
        Designation designation = designationRepository.findById(designationId)
                .orElseThrow(() -> new RuntimeException("Designation not found"));

        if (!designation.getDepartment().getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized to modify this designation");
        }

        Department newDept = departmentRepository
                .findByCompany_CompanyIdAndCode(companyId, designationDto.getDepartmentCode())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        designation.setName(designationDto.getName());
        designation.setDepartment(newDept);
        return designationRepository.save(designation);
    }

    public void deleteDesignation(Integer companyId, Integer designationId) {
        Designation designation = designationRepository.findById(designationId)
                .orElseThrow(() -> new RuntimeException("Designation not found"));

        if (!designation.getDepartment().getCompany().getCompanyId().equals(companyId)) {
            throw new RuntimeException("Unauthorized to delete this designation");
        }

        designationRepository.delete(designation);
    }
}
