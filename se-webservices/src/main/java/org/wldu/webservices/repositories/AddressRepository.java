package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.wldu.webservices.enities.Address;

import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID>, JpaSpecificationExecutor<Address> {
}
