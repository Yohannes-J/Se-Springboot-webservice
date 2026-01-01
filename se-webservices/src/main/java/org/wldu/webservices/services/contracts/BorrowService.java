package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.entities.BorrowBook;
import org.wldu.webservices.entities.Customer;
import org.wldu.webservices.entities.Reservation;
import org.wldu.webservices.repositories.BookRepository;
import org.wldu.webservices.repositories.BorrowRepository;
import org.wldu.webservices.repositories.CustomerRepository;
import org.wldu.webservices.repositories.ReservationRepository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRepository borrowRepo;
    private final CustomerRepository customerRepo;
    private final BookRepository bookRepo;
    private final ReservationRepository reservationRepo;

    // ================= BORROW BOOK =================
    @Transactional
    public BorrowBook borrowBook(Long customerId, Long bookId, int days) {

        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getCopiesAvailable() == null || book.getCopiesAvailable() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }

        BorrowBook borrow = new BorrowBook();
        borrow.setCustomer(customer);
        borrow.setBook(book);
        borrow.setBorrowDate(LocalDateTime.now());
        borrow.setReturnDate(LocalDateTime.now().plusDays(days));
        borrow.setReturned(false);
        borrow.setBrokenPages(0);
        borrow.setLatePenalty(0.0);
        borrow.setLost(false);
        borrow.setLostPrice(0.0);
        borrow.setStatus(false);

        book.setCopiesAvailable(book.getCopiesAvailable() - 1);
        bookRepo.save(book);

        return borrowRepo.save(borrow);
    }

    // ================= RETURN BOOK + AUTO-FULFILL RESERVATION =================
    @Transactional
    public BorrowBook returnBook(Long id) {

        BorrowBook borrow = borrowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (!borrow.isReturned()) {
            borrow.setReturned(true);

            Book book = borrow.getBook();
            book.setCopiesAvailable(book.getCopiesAvailable() + 1);
            bookRepo.save(book);

            borrowRepo.save(borrow);

            // 🔥 AUTO-FULFILL RESERVATION
            autoFulfillReservation(book);
        }

        return borrow;
    }

    // ================= AUTO-FULFILL OLDEST RESERVATION =================
    @Transactional
    public void autoFulfillReservation(Book book) {

        List<Reservation> pendingReservations =
                reservationRepo.findByBookIdAndStatus(book.getId(), "PENDING");

        if (pendingReservations.isEmpty()) return;

        // Oldest reservation first
        pendingReservations.sort(Comparator.comparing(Reservation::getReservationDate));

        Reservation reservation = pendingReservations.get(0);

        // Check if customer already has active borrow
        boolean hasActiveBorrow = borrowRepo
                .findByCustomerId(reservation.getCustomer().getId())
                .stream()
                .anyMatch(b -> !b.isReturned());

        if (hasActiveBorrow) return;
        if (book.getCopiesAvailable() <= 0) return;

        BorrowBook newBorrow = new BorrowBook();
        newBorrow.setCustomer(reservation.getCustomer());
        newBorrow.setBook(book);
        newBorrow.setBorrowDate(LocalDateTime.now());
        newBorrow.setReturnDate(LocalDateTime.now().plusDays(14));
        newBorrow.setReturned(false);
        newBorrow.setBrokenPages(0);
        newBorrow.setLatePenalty(0.0);
        newBorrow.setLost(false);
        newBorrow.setLostPrice(0.0);
        newBorrow.setStatus(false);

        borrowRepo.save(newBorrow);

        book.setCopiesAvailable(book.getCopiesAvailable() - 1);
        bookRepo.save(book);

        reservation.setStatus("FULFILLED");
        reservationRepo.save(reservation);
    }

    // ================= UNDO RETURN =================
    @Transactional
    public BorrowBook undoReturnBook(Long id) {

        BorrowBook borrow = borrowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (borrow.isReturned()) {
            borrow.setReturned(false);

            Book book = borrow.getBook();
            book.setCopiesAvailable(Math.max(book.getCopiesAvailable() - 1, 0));
            bookRepo.save(book);

            return borrowRepo.save(borrow);
        }

        return borrow;
    }

    // ================= GETTERS =================
    public List<BorrowBook> getAllBorrowedBooks() {
        return borrowRepo.findAll();
    }

    public List<BorrowBook> getBorrowedBooksByCustomer(Long customerId) {
        return borrowRepo.findByCustomerId(customerId);
    }

    public List<BorrowBook> getBorrowedBooksByBook(Long bookId) {
        return borrowRepo.findByBookId(bookId);
    }

    // ================= UPDATE PENALTY =================
    @Transactional
    public BorrowBook updatePenalty(Long borrowId, BorrowBook penaltyData) {

        BorrowBook borrow = borrowRepo.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        borrow.setBrokenPages(penaltyData.getBrokenPages());
        borrow.setLatePenalty(penaltyData.getLatePenalty());
        borrow.setLost(penaltyData.getLost());
        borrow.setLostPrice(penaltyData.getLostPrice());
        borrow.setStatus(penaltyData.getStatus());

        return borrowRepo.save(borrow);
    }
}
