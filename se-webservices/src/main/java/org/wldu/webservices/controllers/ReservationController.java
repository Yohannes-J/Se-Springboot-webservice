package org.wldu.webservices.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import dto.ReservationRequest;
import org.wldu.webservices.entities.Reservation;
import org.wldu.webservices.services.contracts.ReservationService;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /* ===================== GET ALL (PAGINATION + SEARCH + STATUS FILTER) ===================== */
    @GetMapping
    public ResponseEntity<Page<Reservation>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String status
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                reservationService.searchWithStatusFilter(search, status, pageable)
        );
    }

    /* ===================== GET BY ID ===================== */
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getById(@PathVariable Long id) {
        return reservationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ===================== CREATE ===================== */
    @PostMapping
    public ResponseEntity<Reservation> create(
            @RequestBody ReservationRequest request
    ) {
        return new ResponseEntity<>(
                reservationService.createReservation(request),
                HttpStatus.CREATED
        );
    }

    /* ===================== UPDATE ===================== */
    @PutMapping("/{id}")
    public ResponseEntity<Reservation> update(
            @PathVariable Long id,
            @RequestBody ReservationRequest request
    ) {
        return ResponseEntity.ok(
                reservationService.updateReservation(id, request)
        );
    }

    /* ===================== DELETE ===================== */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /* ===================== FILTER ENDPOINTS ===================== */

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Reservation>> getByCustomer(
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(
                reservationService.getByCustomerId(customerId)
        );
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Reservation>> getByBook(
            @PathVariable Long bookId
    ) {
        return ResponseEntity.ok(
                reservationService.getByBookId(bookId)
        );
    }
}
