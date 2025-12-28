package org.wldu.webservices.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal; // Added for financial precision
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    private String title;
    private String author;

    @Column(unique = true)
    private String isbn;

    private String category;
    private Integer publishedYear;

    @Column(columnDefinition = "TEXT")
    private String description;

    // FIX: Changed from Double to BigDecimal for consistency with Penalty logic
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    private String coverImageUrl;
    private Integer totalCopies;
    private Integer copiesAvailable;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /* ===================== RELATIONSHIPS ===================== */

    @OneToMany(mappedBy = "book")
    @JsonIgnoreProperties({
            "book",
            "customer",
            "hibernateLazyInitializer",
            "handler"
    })
    private List<BorrowBook> borrowedBooks;

    public Book() {
        this.publishedYear = 2024;
        this.totalCopies = 1;
        this.copiesAvailable = 1;
        // FIX: Default value using BigDecimal
        this.price = new BigDecimal("90.00");
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}