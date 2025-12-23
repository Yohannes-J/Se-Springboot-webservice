package org.wldu.webservices.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.services.contracts.PenaltyService;

import java.util.List;

@RestController
@RequestMapping("/api/penalties")
public class PenaltyController {

    private final PenaltyService penaltyService;

    public PenaltyController(PenaltyService penaltyService) {
        this.penaltyService = penaltyService;
    }

    // Add a new penalty (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Penalty> addPenalty(@RequestBody Penalty penalty) {
        Penalty created = penaltyService.addPenalty(penalty);
        return ResponseEntity.ok(created);
    }

    // Update an existing penalty (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Penalty> updatePenalty(
            @PathVariable Long id,
            @RequestBody Penalty penalty) {
        Penalty updated = penaltyService.updatePenalty(id, penalty);
        return ResponseEntity.ok(updated);
    }

    // Delete a penalty (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePenalty(@PathVariable Long id) {
        penaltyService.deletePenalty(id);
        return ResponseEntity.noContent().build();
    }

    // Get penalty by ID (any authenticated user)
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Penalty> getPenalty(@PathVariable Long id) {
        Penalty penalty = penaltyService.getPenalty(id);
        return ResponseEntity.ok(penalty);
    }

    // Get all penalties (any authenticated user)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getAllPenalties() {
        List<Penalty> penalties = penaltyService.getAllPenalties();
        return ResponseEntity.ok(penalties);
    }

    // Get penalties by customer ID
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getPenaltiesByCustomer(@PathVariable Long customerId) {
        List<Penalty> penalties = penaltyService.getPenaltiesByCustomer(customerId);
        return ResponseEntity.ok(penalties);
    }

    // Get penalties by book ID
    @GetMapping("/book/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getPenaltiesByBook(@PathVariable Long bookId) {
        List<Penalty> penalties = penaltyService.getPenaltiesByBook(bookId);
        return ResponseEntity.ok(penalties);
    }

    // Get penalties by borrow book ID
    @GetMapping("/borrow/{borrowBookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getPenaltiesByBorrowBook(@PathVariable Long borrowBookId) {
        List<Penalty> penalties = penaltyService.getPenaltiesByBorrowBook(borrowBookId);
        return ResponseEntity.ok(penalties);
    }

    // ✅ Update penalty status (Admin or Librarian can mark resolved)
    @PutMapping("/status/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Penalty> updatePenaltyStatus(
            @PathVariable Long id,
            @RequestParam boolean status) {
        Penalty penalty = penaltyService.getPenalty(id);
        penalty.setStatus(status);
        Penalty updated = penaltyService.updatePenalty(id, penalty);
        return ResponseEntity.ok(updated);
    }
}
