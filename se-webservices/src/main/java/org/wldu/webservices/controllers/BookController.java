package org.wldu.webservices.controllers;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.Book;
import org.wldu.webservices.services.contracts.BookService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/fetch")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/list")
    public Map<String, Object> getBookList(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "1") int draw
    ) {

        Page<Book> bookPage =
                bookService.getBooks(search, page, size, sortBy, sortDir);

        Map<String, Object> response = new HashMap<>();

        response.put("draw", draw);
        response.put("data", bookPage.getContent());
        response.put("recordsTotal", bookPage.getTotalElements());
        response.put("recordsFiltered", bookPage.getTotalElements());
        response.put("currentPage", bookPage.getNumber());
        response.put("totalPages", bookPage.getTotalPages());
        response.put("pageSize", bookPage.getSize());

        return response;
    }


    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/addbook")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> addBook(@RequestBody Book book) {
        Book created = bookService.addBooks(book);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book updatedBook) {
        try {
            Book updated = bookService.updateBook(id, updatedBook);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")

    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}
