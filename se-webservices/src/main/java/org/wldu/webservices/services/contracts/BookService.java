package org.wldu.webservices.services.contracts;


import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.repositories.BookRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository){
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks(){
        return bookRepository.findAll();
    }

    public Book addBooks(Book book){
        book.setId(null);
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public Book updateBook(Long id, Book updatedBook) {
        return bookRepository.findById(id).map(book -> {

            book.setTitle(updatedBook.getTitle());
            book.setAuthor(updatedBook.getAuthor());
            book.setIsbn(updatedBook.getIsbn());
            book.setCategory(updatedBook.getCategory());
            book.setPublishedYear(updatedBook.getPublishedYear());
            book.setDescription(updatedBook.getDescription());
            book.setCoverImageUrl(updatedBook.getCoverImageUrl());
            book.setTotalCopies(updatedBook.getTotalCopies());
            book.setCopiesAvailable(updatedBook.getCopiesAvailable());
            book.setUpdatedAt(LocalDateTime.now());

            return bookRepository.save(book);
        }).orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
    }

    public Page<Book> getBooks(String search, int page, int size, String sortBy, String sortDir) {

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
