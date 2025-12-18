package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.wldu.webservices.enities.Courses;

import java.util.UUID;

public interface CoursesRepository extends JpaRepository<Courses, UUID>, JpaSpecificationExecutor<Courses> {
}
