package org.wldu.webservices.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "borrow_books")
public class BorrowBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private LocalDateTime borrowDate;
    private LocalDateTime returnDate;
    private boolean returned = false;

    // ===== PENALTY FIELDS =====
    private Integer brokenPages = 0;
    private Double latePenalty = 0.0;
    private Boolean lost = false;
    private Double lostPrice = 0.0;
    private Boolean status = false; // false=Pending, true=Resolved
}
