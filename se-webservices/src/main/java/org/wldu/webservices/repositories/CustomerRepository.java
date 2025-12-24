package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.entities.Customer;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    List<Customer> findByNameContainingIgnoreCase(String name);

    List<Customer> findByEmailContainingIgnoreCase(String email);
}
