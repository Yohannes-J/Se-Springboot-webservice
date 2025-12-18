package org.wldu.webservices.enities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
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

    private String coverImageUrl;
    private Integer totalCopies;
    private Integer copiesAvailable;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "book")
    @JsonIgnoreProperties({"book", "user"}) // prevent recursion
    private List<BorrowBook> borrowedBooks;

    public Book() {
        this.publishedYear = 2024;
        this.totalCopies = 1;
        this.copiesAvailable = 1;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
