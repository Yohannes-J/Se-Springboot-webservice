package org.wldu.webservices.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.auths.UsersRepository;
import org.wldu.webservices.repositories.BookRepository;
import org.wldu.webservices.repositories.BorrowRepository;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin") // class-level mapping to match frontend "/admin/dashboard"
public class AdminDashboardController {

    private final UsersRepository usersRepository;
    private final BookRepository bookRepository;
    private final BorrowRepository borrowRepository;

    public AdminDashboardController(
            UsersRepository usersRepository,
            BookRepository bookRepository,
            BorrowRepository borrowRepository) {
        this.usersRepository = usersRepository;
        this.bookRepository = bookRepository;
        this.borrowRepository = borrowRepository;
    }

    /**
     * Get admin dashboard stats: total users, total books, borrowed books, returned books
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')") // only accessible by admin
    public ResponseEntity<Map<String, Long>> getStats() {
        long totalUsers = usersRepository.count(); // total users
        long totalBooks = bookRepository.count();  // total books
        long borrowedBooks = borrowRepository.countByReturnedFalse(); // not returned yet
        long returnedBooks = borrowRepository.countByReturnedTrue();  // already returned

        Map<String, Long> stats = new HashMap<>();
        stats.put("users", totalUsers);
        stats.put("books", totalBooks);
        stats.put("borrowed", borrowedBooks);
        stats.put("returned", returnedBooks);

        return ResponseEntity.ok(stats);
    }
}
