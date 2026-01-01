package org.wldu.webservices.services.contracts;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.exception.BadRequestException;
import org.wldu.webservices.exception.GlobalExceptionHandler;
import org.wldu.webservices.repositories.BookRepository;
import org.wldu.webservices.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository){
        this.bookRepository = bookRepository;
    }

    /* =======================
       GET ALL BOOKS
       ======================= */
    public List<Book> getAllBooks(){
        return bookRepository.findAll();
    }

    /* =======================
       ADD BOOK
       ======================= */
    public Book addBooks(Book book){
        book.setId(null);

        if (book.getCreatedAt() == null) {
            book.setCreatedAt(LocalDateTime.now());
        }
        book.setUpdatedAt(LocalDateTime.now());

        return bookRepository.save(book);
    }

    /* =======================
       DELETE BOOK
       ======================= */
    public void deleteBook(Long id) {

        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Book not found with id: " + id
            );
        }

        bookRepository.deleteById(id);
    }

    /* =======================
       UPDATE BOOK
       ======================= */
    public Book updateBook(Long id, Book updatedBook) {

        return bookRepository.findById(id)
                .map(book -> {
                    book.setTitle(updatedBook.getTitle());
                    book.setAuthor(updatedBook.getAuthor());
                    book.setIsbn(updatedBook.getIsbn());
                    book.setCategory(updatedBook.getCategory());
                    book.setPublishedYear(updatedBook.getPublishedYear());
                    book.setDescription(updatedBook.getDescription());
                    book.setCoverImageUrl(updatedBook.getCoverImageUrl());
                    book.setTotalCopies(updatedBook.getTotalCopies());
                    book.setCopiesAvailable(updatedBook.getCopiesAvailable());

                    // price (safe update)
                    if (updatedBook.getPrice() != null) {
                        book.setPrice(updatedBook.getPrice());
                    }

                    book.setUpdatedAt(LocalDateTime.now());
                    return bookRepository.save(book);
                })
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found with id: " + id
                        )
                );
    }

    /* =======================
       PAGINATION + SEARCH
       ======================= */
    public Page<Book> getBooks(
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {

        if (page < 0 || size <= 0) {
            throw new BadRequestException(
                    "Page index must be >= 0 and size must be > 0"
            );
        }

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        if (search != null && !search.isEmpty()) {
            return bookRepository.findByTitleContainingIgnoreCase(search, pageable);
        }

        return bookRepository.findAll(pageable);
    }
}
