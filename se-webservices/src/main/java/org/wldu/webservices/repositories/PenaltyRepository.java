package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.wldu.webservices.entities.Penalty;

import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    // Finds all penalty records for a specific customer
    List<Penalty> findByCustomerId(Long customerId);

    // Finds all penalty records for a specific book
    List<Penalty> findByBookId(Long bookId);

    // Finds the penalty record associated with a specific borrowing transaction
    List<Penalty> findByBorrowBookId(Long borrowBookId);
}