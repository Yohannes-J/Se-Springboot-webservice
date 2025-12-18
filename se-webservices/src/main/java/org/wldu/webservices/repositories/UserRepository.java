package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.enities.User;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    List<User> findByNameContainingIgnoreCase(String name);

    List<User> findByEmailContainingIgnoreCase(String email);
}
