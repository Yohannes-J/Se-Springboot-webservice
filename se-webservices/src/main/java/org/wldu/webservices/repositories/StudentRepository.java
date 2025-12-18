package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.wldu.webservices.enities.StudentsEntity;

import java.util.UUID;

public interface StudentRepository extends JpaRepository <StudentsEntity, Long> {
}
