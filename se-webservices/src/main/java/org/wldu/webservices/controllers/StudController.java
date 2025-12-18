package org.wldu.webservices.controllers;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.enities.Student;
import org.wldu.webservices.services.contracts.StudService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudController {

    private final StudService studentService;

    public StudController(StudService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/list")
    public Map<String, Object> getStudentsList(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "1") int draw
    ) {

        Page<Student> studentPage =
                studentService.getStudents(search, page, size, sortBy, sortDir);

        Map<String, Object> response = new HashMap<>();

        response.put("draw", draw);
        response.put("data", studentPage.getContent());
        response.put("recordsTotal", studentPage.getTotalElements());
        response.put("recordsFiltered", studentPage.getTotalElements());
        response.put("currentPage", studentPage.getNumber());
        response.put("totalPages", studentPage.getTotalPages());
        response.put("pageSize", studentPage.getSize());

        return response;
    }


    @PostMapping
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        Student created = studentService.addStudent(student);
        return ResponseEntity.ok(created);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student updatedStudent
    ) {
        try {
            Student updated = studentService.updateStudent(id, updatedStudent);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
