package org.wldu.webservices.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.services.contracts.PenaltyService;

import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
public class PenaltyController {

    private final PenaltyService penaltyService;

    /* =====================================================
       CREATE PENALTY (ADMIN ONLY)
       ===================================================== */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Penalty> createPenalty(@RequestBody Penalty penalty) {
        Penalty created = penaltyService.addPenalty(penalty);
        return ResponseEntity.ok(created);
    }

    /* =====================================================
       UPDATE PENALTY (ADMIN ONLY)
       ===================================================== */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Penalty> updatePenalty(
            @PathVariable Long id,
            @RequestBody Penalty penalty) {

        Penalty updated = penaltyService.updatePenalty(id, penalty);
        return ResponseEntity.ok(updated);
    }

    /* =====================================================
       DELETE PENALTY (ADMIN ONLY)
       ===================================================== */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePenalty(@PathVariable Long id) {
        penaltyService.deletePenalty(id);
        return ResponseEntity.noContent().build();
    }

    /* =====================================================
       GET PENALTY BY ID
       ===================================================== */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Penalty> getPenaltyById(@PathVariable Long id) {
        return ResponseEntity.ok(penaltyService.getPenalty(id));
    }

    /* =====================================================
       GET ALL PENALTIES
       ===================================================== */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getAllPenalties() {
        return ResponseEntity.ok(penaltyService.getAllPenalties());
    }

    /* =====================================================
       GET PENALTIES BY CUSTOMER
       ===================================================== */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getPenaltiesByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                penaltyService.getPenaltiesByCustomer(customerId)
        );
    }

    /* =====================================================
       GET PENALTIES BY BOOK
       ===================================================== */
    @GetMapping("/book/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getPenaltiesByBook(
            @PathVariable Long bookId) {

        return ResponseEntity.ok(
                penaltyService.getPenaltiesByBook(bookId)
        );
    }

    /* =====================================================
       GET PENALTIES BY BORROW RECORD
       ===================================================== */
    @GetMapping("/borrow/{borrowBookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getPenaltiesByBorrowBook(
            @PathVariable Long borrowBookId) {

        return ResponseEntity.ok(
                penaltyService.getPenaltiesByBorrowBook(borrowBookId)
        );
    }
    /* =====================================================
       RESOLVE / UNRESOLVE PENALTY
       (ADMIN OR LIBRARIAN)
       ===================================================== */
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Penalty> resolvePenalty(
            @PathVariable Long id,
            @RequestParam boolean resolved) {

        Penalty penalty = penaltyService.getPenalty(id);
        penalty.setResolved(resolved);

        return ResponseEntity.ok(
                penaltyService.updatePenalty(id, penalty)
        );
    }

    /* =====================================================
       MARK PENALTY AS PAID
       (ADMIN OR LIBRARIAN)
       ===================================================== */
    @PutMapping("/{id}/paid")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Penalty> markPenaltyPaid(
            @PathVariable Long id,
            @RequestParam boolean paid) {

        Penalty penalty = penaltyService.getPenalty(id);
        penalty.setPaid(paid);

        return ResponseEntity.ok(
                penaltyService.updatePenalty(id, penalty)
        );
    }
}