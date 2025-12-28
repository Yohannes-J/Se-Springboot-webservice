package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.entities.BorrowBook;
import org.wldu.webservices.entities.Penalty;

import java.util.List;
import java.util.Optional;

public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    Optional<Penalty> findByBorrow(BorrowBook borrow);
    List<Penalty> findByCustomerId(Long customerId);
}
