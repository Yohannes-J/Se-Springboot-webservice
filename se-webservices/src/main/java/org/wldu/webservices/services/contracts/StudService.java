package org.wldu.webservices.services.contracts;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.wldu.webservices.enities.Student;
import org.wldu.webservices.repositories.StudRepository;

import java.util.List;

@Service
public class StudService {

    private final StudRepository studRepository;

    public StudService(StudRepository studRepository) {
        this.studRepository = studRepository;
    }


    public List<Student> getAllStudents() {
        return studRepository.findAll();
    }


    public Student addStudent(Student student) {
        return studRepository.save(student);
    }

    // ✔ Delete
    public void deleteStudent(Long id) {
        studRepository.deleteById(id);
    }

    // ✔ Update
    public Student updateStudent(Long id, Student updatedStudent) {
        return studRepository.findById(id).map(student -> {

            student.setName(updatedStudent.getName());
            student.setGender(updatedStudent.getGender());
            student.setAddress(updatedStudent.getAddress());
            student.setEmail(updatedStudent.getEmail());
            student.setPhone(updatedStudent.getPhone());
            student.setAge(updatedStudent.getAge());
            student.setDepartment(updatedStudent.getDepartment());

            return studRepository.save(student);
        }).orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Page<Student> getStudents(String search, int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        if (search != null && !search.isEmpty()) {
            return studRepository.findByNameContainingIgnoreCase(search, pageable);
        }

        return studRepository.findAll(pageable);
    }
}
