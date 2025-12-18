package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.enities.BorrowBook;

import java.util.List;

public interface BorrowRepository extends JpaRepository<BorrowBook,Long> {
    List<BorrowBook> findByUserId(Long userId);

    List<BorrowBook> findByBookId(Long bookId);
    long countByReturnedFalse();
    long countByReturnedTrue();
}
