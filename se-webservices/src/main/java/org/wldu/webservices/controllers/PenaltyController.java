package org.wldu.webservices.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.services.contracts.PenaltyService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5432", allowCredentials = "true")
public class PenaltyController {

    private final PenaltyService penaltyService;

    /* =====================================================
       GET ALL RECORDS
       ===================================================== */
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Penalty>> getAllPenalties() {
        return ResponseEntity.ok(penaltyService.getAllPenalties());
    }

    /* =====================================================
       UPSERT BY BORROW ID (THE MISSING LINK)
       This allows your React code to update the Penalty table
       even if the record doesn't exist yet for a specific borrow.
       ===================================================== */
    @PutMapping("/upsert-by-borrow/{borrowId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Penalty> upsertByBorrow(
            @PathVariable Long borrowId,
            @RequestBody Map<String, Object> updates) {

        // This method will find the penalty linked to the borrowId,
        // or create it if it's the first time an admin is adding a fine.
        Penalty updated = penaltyService.createOrUpdateFromBorrow(borrowId, updates);
        return ResponseEntity.ok(updated);
    }

    /* =====================================================
       STANDARD UPDATE (By Penalty ID)
       ===================================================== */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Penalty> updatePenaltyField(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        Penalty updated = penaltyService.partialUpdate(id, updates);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Penalty> getPenaltyById(@PathVariable Long id) {
        return ResponseEntity.ok(penaltyService.getPenalty(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePenalty(@PathVariable Long id) {
        penaltyService.deletePenalty(id);
        return ResponseEntity.noContent().build();
    }
}