package org.wldu.webservices.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.enities.BorrowBook;
import org.wldu.webservices.services.contracts.BorrowService;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(
            @RequestParam Long userId,
            @RequestParam Long bookId,
            @RequestParam(defaultValue = "14") int days
    ) {
        try {
            return ResponseEntity.ok(borrowService.borrowBook(userId, bookId, days));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/return/{id}")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(borrowService.returnBook(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<BorrowBook>> getAll() {
        return ResponseEntity.ok(borrowService.getAllBorrowedBooks());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BorrowBook>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getBorrowedBooksByUser(userId));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<BorrowBook>> getByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(borrowService.getBorrowedBooksByBook(bookId));
    }
}
