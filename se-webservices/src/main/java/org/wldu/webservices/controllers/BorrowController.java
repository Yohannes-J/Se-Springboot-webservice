package org.wldu.webservices.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.BorrowBook;
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
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> borrowBook(
            @RequestParam Long customerId,
            @RequestParam Long bookId,
            @RequestParam(defaultValue = "14") int days
    ) {
        try {
            return ResponseEntity.ok(borrowService.borrowBook(customerId, bookId, days));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    // ===== ADD THIS BELOW OTHER METHODS =====
    @PutMapping("/penalty/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BorrowBook> updatePenalty(
            @PathVariable Long id,
            @RequestBody BorrowBook penaltyData
    ) {
        return ResponseEntity.ok(borrowService.updatePenalty(id, penaltyData));
    }
    @PutMapping("/return/{id}")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(borrowService.returnBook(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    // Add this to BorrowController.java
    @PutMapping("/undo-return/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> undoReturn(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(borrowService.undoReturnBook(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<BorrowBook>> getAll() {
        return ResponseEntity.ok(borrowService.getAllBorrowedBooks());
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<List<BorrowBook>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(borrowService.getBorrowedBooksByCustomer(customerId));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<BorrowBook>> getByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(borrowService.getBorrowedBooksByBook(bookId));
    }
}
