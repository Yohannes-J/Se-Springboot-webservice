package org.wldu.webservices.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.wldu.webservices.entities.Reservation;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /* ===================== FILTERS ===================== */

    List<Reservation> findByCustomerId(Long customerId);

    List<Reservation> findByBookId(Long bookId);

    /* ===================== FILTERS WITH STATUS ===================== */

    List<Reservation> findByBookIdAndStatus(Long bookId, String status);

    /* ===================== PAGINATION + SEARCH ===================== */

    Page<Reservation>
    findByBook_TitleContainingIgnoreCaseOrCustomer_NameContainingIgnoreCase(
            String bookTitle,
            String customerName,
            Pageable pageable
    );

    /* ===================== PAGINATION + SEARCH + STATUS FILTER ===================== */

    @Query("SELECT r FROM Reservation r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(r.book.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Reservation> findByStatusAndSearch(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );
}
