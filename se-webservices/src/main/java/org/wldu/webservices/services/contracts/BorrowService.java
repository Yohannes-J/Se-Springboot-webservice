package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.entities.BorrowBook;
import org.wldu.webservices.entities.Customer;
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

    /** Borrow a book */
    public BorrowBook borrowBook(Long customerId, Long bookId, int days) {
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Check if copies are available
        if (book.getCopiesAvailable() == null || book.getCopiesAvailable() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }

        // Create borrow record
        BorrowBook borrow = new BorrowBook();
        borrow.setCustomer(customer);
        borrow.setBook(book);
        borrow.setBorrowDate(LocalDateTime.now());
        borrow.setReturnDate(LocalDateTime.now().plusDays(days));
        borrow.setReturned(false);

        // Reduce available copies
        book.setCopiesAvailable(book.getCopiesAvailable() - 1);
        bookRepo.save(book);

        return borrowRepo.save(borrow);
    }

    /** Return a book */
    public BorrowBook returnBook(Long id) {
        BorrowBook borrow = borrowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (!borrow.isReturned()) {
            borrow.setReturned(true);

            // Increase book copiesAvailable
            Book book = borrow.getBook();
            book.setCopiesAvailable(book.getCopiesAvailable() + 1);
            bookRepo.save(book);

            borrowRepo.save(borrow);
        }

        return borrow;
    }

    public List<BorrowBook> getAllBorrowedBooks() {
        return borrowRepo.findAll();
    }

    public List<BorrowBook> getBorrowedBooksByCustomer(Long customerId) {
        return borrowRepo.findByCustomerId(customerId);
    }

    public List<BorrowBook> getBorrowedBooksByBook(Long bookId) {
        return borrowRepo.findByBookId(bookId);
    }
}
