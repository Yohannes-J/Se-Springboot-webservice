package org.wldu.webservices.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.enities.Department;
import org.wldu.webservices.repositories.DepartmentRepository;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    // ✅ Add new department
    @PostMapping("/add")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        Department savedDepartment = departmentRepository.save(department);
        return ResponseEntity.ok(savedDepartment);
    }

    // ✅ Fetch all departments
    @GetMapping("/fetchall")
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    // ✅ Fetch department by ID
    @GetMapping("/fetchById/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        Department department = departmentRepository.findById(id).orElse(null);
        if (department != null) {
            return ResponseEntity.ok(department);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Update department
    @PutMapping("/update/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department updatedData) {
        Department existingDepartment = departmentRepository.findById(id).orElse(null);

        if (existingDepartment != null) {
            existingDepartment.setDepartment(updatedData.getDepartment());
            existingDepartment.setStudent(updatedData.getStudent());
            Department updatedDepartment = departmentRepository.save(existingDepartment);
            return ResponseEntity.ok(updatedDepartment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Delete department
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        if (departmentRepository.existsById(id)) {
            departmentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
