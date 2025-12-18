package org.wldu.webservices.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.enities.Student;

public interface StudRepository extends JpaRepository<Student, Long> {
    Page<Student> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
