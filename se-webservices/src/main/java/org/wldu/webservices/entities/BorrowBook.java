package org.wldu.webservices.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "borrow_books")
public class BorrowBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties("borrowedBooks")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "book_id")
    @JsonIgnoreProperties("borrowers")
    private Book book;

    private LocalDateTime borrowDate;

    private LocalDateTime returnDate;

    private boolean returned = false;
}
