package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.entities.Penalty;

import java.util.List;

public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    List<Penalty> findByCustomerId(Long CustomerId);

    List<Penalty> findByBookId(Long bookId);

    List<Penalty> findByBorrowBookId(Long borrowBookId);
}
