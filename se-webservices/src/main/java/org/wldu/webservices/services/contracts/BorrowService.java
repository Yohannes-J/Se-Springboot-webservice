package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.entities.BorrowBook;
import org.wldu.webservices.entities.Customer;
import org.wldu.webservices.exception.BadRequestException;
import org.wldu.webservices.exception.ResourceNotFoundException;
import org.wldu.webservices.repositories.BookRepository;
import org.wldu.webservices.repositories.BorrowRepository;
import org.wldu.webservices.repositories.CustomerRepository;


import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRepository borrowRepo;
    private final CustomerRepository customerRepo;
    private final BookRepository bookRepo;

    /* =======================
       BORROW BOOK
       ======================= */
    public BorrowBook borrowBook(Long customerId, Long bookId, int days) {

        if (days <= 0) {
            throw new BadRequestException(
                    "Borrow days must be greater than zero"
            );
        }

        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: " + customerId
                        )
                );

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found with id: " + bookId
                        )
                );

        if (book.getCopiesAvailable() == null || book.getCopiesAvailable() <= 0) {
            throw new BadRequestException(
                    "No copies available for this book"
            );
        }

        BorrowBook borrow = new BorrowBook();
        borrow.setCustomer(customer);
        borrow.setBook(book);
        borrow.setBorrowDate(LocalDateTime.now());
        borrow.setReturnDate(LocalDateTime.now().plusDays(days));
        borrow.setReturned(false);

        // decrease copies
        book.setCopiesAvailable(book.getCopiesAvailable() - 1);
        bookRepo.save(book);

        return borrowRepo.save(borrow);
    }

    /* =======================
       RETURN BOOK
       ======================= */
    public BorrowBook returnBook(Long id) {

        BorrowBook borrow = borrowRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Borrow record not found with id: " + id
                        )
                );

        if (borrow.isReturned()) {
            throw new BadRequestException(
                    "Book is already returned"
            );
        }

        borrow.setReturned(true);

        Book book = borrow.getBook();
        book.setCopiesAvailable(book.getCopiesAvailable() + 1);
        bookRepo.save(book);

        return borrowRepo.save(borrow);
    }

    /* =======================
       UNDO RETURN
       ======================= */
    public BorrowBook undoReturnBook(Long id) {

        BorrowBook borrow = borrowRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Borrow record not found with id: " + id
                        )
                );

        if (!borrow.isReturned()) {
            throw new BadRequestException(
                    "Borrow record is not marked as returned"
            );
        }

        Book book = borrow.getBook();

        if (book.getCopiesAvailable() == null || book.getCopiesAvailable() <= 0) {
            throw new BadRequestException(
                    "Cannot undo return, no available copies to decrease"
            );
        }

        borrow.setReturned(false);
        book.setCopiesAvailable(book.getCopiesAvailable() - 1);

        bookRepo.save(book);
        return borrowRepo.save(borrow);
    }

    /* =======================
       READ OPERATIONS
       ======================= */
    public List<BorrowBook> getAllBorrowedBooks() {
        return borrowRepo.findAll();
    }

    public List<BorrowBook> getBorrowedBooksByCustomer(Long customerId) {

        if (!customerRepo.existsById(customerId)) {
            throw new ResourceNotFoundException(
                    "Customer not found with id: " + customerId
            );
        }

        return borrowRepo.findByCustomerId(customerId);
    }

    public List<BorrowBook> getBorrowedBooksByBook(Long bookId) {

        if (!bookRepo.existsById(bookId)) {
            throw new ResourceNotFoundException(
                    "Book not found with id: " + bookId
            );
        }

        return borrowRepo.findByBookId(bookId);
    }

    /* =======================
       UPDATE PENALTY
       ======================= */
    public BorrowBook updatePenalty(Long borrowId, BorrowBook penaltyData) {

        BorrowBook borrow = borrowRepo.findById(borrowId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Borrow record not found with id: " + borrowId
                        )
                );

        borrow.setBrokenPages(penaltyData.getBrokenPages());
        borrow.setLatePenalty(penaltyData.getLatePenalty());
        borrow.setLost(penaltyData.getLost());
        borrow.setLostPrice(penaltyData.getLostPrice());
        borrow.setStatus(penaltyData.getStatus());

        return borrowRepo.save(borrow);
    }
}
