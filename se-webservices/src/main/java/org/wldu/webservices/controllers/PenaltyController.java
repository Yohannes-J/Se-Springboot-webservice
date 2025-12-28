package org.wldu.webservices.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.BorrowBook;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.services.contracts.PenaltyService;

import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PenaltyController {

    private final PenaltyService penaltyService;

    // CREATE / UPDATE penalty for a borrow
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping("/{borrowId}")
    public ResponseEntity<Penalty> saveOrUpdatePenalty(
            @PathVariable Long borrowId,
            @RequestBody Penalty penalty
    ) {
        // This will either create a new penalty or update existing for the borrow
        return ResponseEntity.ok(penaltyService.saveOrUpdatePenalty(borrowId, penalty));
    }

    // UPDATE only status
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<Penalty> updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean status
    ) {
        return ResponseEntity.ok(penaltyService.updateStatus(id, status));
    }

    // DELETE penalty
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        penaltyService.deletePenalty(id);
        return ResponseEntity.noContent().build();
    }

    // GET all penalties (optional, admin use)
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @GetMapping
    public ResponseEntity<List<Penalty>> getAll() {
        return ResponseEntity.ok(penaltyService.getAllPenalties());
    }

    // GET penalties by customer
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','CUSTOMER')")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Penalty>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(penaltyService.getPenaltiesByCustomer(customerId));
    }
}
