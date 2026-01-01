package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dto.ReservationRequest;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.entities.Customer;
import org.wldu.webservices.entities.Reservation;
import org.wldu.webservices.repositories.BookRepository;
import org.wldu.webservices.repositories.CustomerRepository;
import org.wldu.webservices.repositories.ReservationRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final CustomerRepository customerRepository;
    private final BookRepository bookRepository;

    /* ===================== CREATE ===================== */
    public Reservation createReservation(ReservationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Reservation request cannot be null");
        }
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID must not be null");
        }
        if (request.getBookId() == null) {
            throw new IllegalArgumentException("Book ID must not be null");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found with ID: " + request.getCustomerId()));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() ->
                        new RuntimeException("Book not found with ID: " + request.getBookId()));

        Reservation reservation = Reservation.builder()
                .customer(customer)
                .book(book)
                .expiryDate(request.getExpiryDate())
                .status(
                        request.getStatus() != null
                                ? request.getStatus()
                                : "PENDING"
                )
                .build();

        return reservationRepository.save(reservation);
    }

    /* ===================== UPDATE ===================== */
    public Reservation updateReservation(Long id, ReservationRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Reservation ID must not be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("Reservation request cannot be null");
        }

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Reservation not found with ID: " + id));

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() ->
                            new RuntimeException("Customer not found with ID: " + request.getCustomerId()));
            reservation.setCustomer(customer);
        }

        if (request.getBookId() != null) {
            Book book = bookRepository.findById(request.getBookId())
                    .orElseThrow(() ->
                            new RuntimeException("Book not found with ID: " + request.getBookId()));
            reservation.setBook(book);
        }

        if (request.getExpiryDate() != null) {
            reservation.setExpiryDate(request.getExpiryDate());
        }

        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        }

        return reservationRepository.save(reservation);
    }

    /* ===================== READ ===================== */
    @Transactional(readOnly = true)
    public Optional<Reservation> getById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return reservationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Page<Reservation> search(String keyword, Pageable pageable) {
        return reservationRepository
                .findByBook_TitleContainingIgnoreCaseOrCustomer_NameContainingIgnoreCase(
                        keyword, keyword, pageable
                );
    }

    @Transactional(readOnly = true)
    public Page<Reservation> searchWithStatusFilter(String keyword, String status, Pageable pageable) {
        String statusFilter = (status != null && !status.trim().isEmpty()) ? status : null;
        return reservationRepository.findByStatusAndSearch(statusFilter, keyword, pageable);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getByCustomerId(Long customerId) {
        if (customerId == null) {
            return List.of();
        }
        return reservationRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getByBookId(Long bookId) {
        if (bookId == null) {
            return List.of();
        }
        return reservationRepository.findByBookId(bookId);
    }

    /* ===================== DELETE ===================== */
    public void delete(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Reservation ID must not be null");
        }
        reservationRepository.deleteById(id);
    }
}
