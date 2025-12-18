package org.wldu.webservices.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.enities.StudentsEntity;
import org.wldu.webservices.repositories.StudentRepository;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/addStudents")
    public ResponseEntity<StudentsEntity> createStudents(@RequestBody StudentsEntity students) {
        StudentsEntity response = studentRepository.save(students);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/fetchall")
    public List<StudentsEntity> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/fetchById/{id}")
    public StudentsEntity getStudent(@PathVariable Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    @PutMapping("/update/{id}")
    public StudentsEntity updateStudent(@PathVariable Long id, @RequestBody StudentsEntity updatedData) {
        StudentsEntity existingData = studentRepository.findById(id).orElse(null);

        if (existingData != null) {
            existingData.setName(updatedData.getName());
            existingData.setAge(updatedData.getAge());
            existingData.setDepartment(updatedData.getDepartment());
            existingData.setEmail(updatedData.getEmail());
            existingData.setPhone(updatedData.getPhone());
            return studentRepository.save(existingData);
        } else {
            return null;
        }
    }

    @DeleteMapping("/delete/{id}")
    public void deleteStudent(@PathVariable Long id) {
        studentRepository.deleteById(id);
    }
}
