package org.wldu.webservices.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "penalties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ===================== RELATIONSHIPS ===================== */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_book_id", nullable = false)
    private BorrowBook borrowBook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    /* ===================== PENALTY DETAILS ===================== */

    // Number of days overdue
    private Integer overdueDays;

    // Late return penalty
    @Column(nullable = false)
    private BigDecimal latePenalty = BigDecimal.ZERO;

    // Broken pages penalty
    @Column(nullable = false)
    private BigDecimal brokenPenalty = BigDecimal.ZERO;

    // Lost book penalty
    @Column(nullable = false)
    private BigDecimal lostPenalty = BigDecimal.ZERO;

    // Total penalty amount
    @Column(nullable = false)
    private BigDecimal totalPenalty = BigDecimal.ZERO;

    /* ===================== STATUS ===================== */

    // Paid or not
    @Column(nullable = false)
    private boolean paid = false;

    // Penalty resolved by admin/librarian
    @Column(nullable = false)
    private boolean resolved = false;

    /* ===================== AUDIT ===================== */

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}