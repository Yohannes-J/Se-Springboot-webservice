package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.entities.DigitalMaterial;

public interface DigitalMaterialRepository extends JpaRepository<DigitalMaterial, Long> {
}
