package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wldu.webservices.enities.Book;
import org.wldu.webservices.enities.BorrowBook;
import org.wldu.webservices.enities.Customer;
import org.wldu.webservices.repositories.BookRepository;
import org.wldu.webservices.repositories.BorrowRepository;
import org.wldu.webservices.repositories.CustomerRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRepository borrowRepo;
    private final CustomerRepository userRepo;
    private final BookRepository bookRepo;

    /** Borrow a book */
    public BorrowBook borrowBook(Long userId, Long bookId, int days) {
        Customer user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Check if copies are available
        if (book.getCopiesAvailable() == null || book.getCopiesAvailable() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }

        // Create borrow record
        BorrowBook borrow = new BorrowBook();
        borrow.setUser(user);
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

    public List<BorrowBook> getBorrowedBooksByUser(Long userId) {
        return borrowRepo.findByUserId(userId);
    }

    public List<BorrowBook> getBorrowedBooksByBook(Long bookId) {
        return borrowRepo.findByBookId(bookId);
    }
}
