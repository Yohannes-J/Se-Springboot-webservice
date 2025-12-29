package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.entities.Materials;

public interface MaterialRepository extends JpaRepository<Materials, Long> {
}
