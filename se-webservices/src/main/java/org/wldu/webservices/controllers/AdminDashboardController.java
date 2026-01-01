package org.wldu.webservices.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.auths.UsersRepository;
import org.wldu.webservices.repositories.BookRepository;
import org.wldu.webservices.repositories.BorrowRepository;
import org.wldu.webservices.repositories.CustomerRepository;
import org.wldu.webservices.repositories.ReservationRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final UsersRepository usersRepository;
    private final BookRepository bookRepository;
    private final BorrowRepository borrowRepository;
    private final CustomerRepository customerRepository;
    private final ReservationRepository reservationRepository;

    public AdminDashboardController(
            UsersRepository usersRepository,
            BookRepository bookRepository,
            CustomerRepository customerRepository,
            BorrowRepository borrowRepository,
            ReservationRepository reservationRepository) {
        this.usersRepository = usersRepository;
        this.bookRepository = bookRepository;
        this.borrowRepository = borrowRepository;
        this.customerRepository = customerRepository;
        this.reservationRepository = reservationRepository;
    }

    /**
     * Get admin dashboard stats: total users, total books, borrowed books, returned books, customers, and reservations
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        long totalUsers = usersRepository.count();
        long totalBooks = bookRepository.count();
        long totalCustomers = customerRepository.count();
        long borrowedBooks = borrowRepository.countByReturnedFalse();
        long returnedBooks = borrowRepository.countByReturnedTrue();
        long totalReservations = reservationRepository.count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("users", totalUsers);
        stats.put("books", totalBooks);
        stats.put("borrowed", borrowedBooks);
        stats.put("returned", returnedBooks);
        stats.put("customers", totalCustomers);
        stats.put("reservations", totalReservations);

        return ResponseEntity.ok(stats);
    }
}
