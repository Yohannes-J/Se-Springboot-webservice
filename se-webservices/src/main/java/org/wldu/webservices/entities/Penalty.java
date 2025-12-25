package org.wldu.webservices.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"penalties", "hibernateLazyInitializer", "handler"})
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "borrow_book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BorrowBook borrowBook;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"borrowedBooks", "hibernateLazyInitializer", "handler"})
    private Book book;

    /* ===================== RAW STATUS ===================== */

    @Builder.Default
    @Column(nullable = false)
    private Integer brokenPages = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean lost = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean overdue = false;

    /* ===================== CALCULATED FIELDS ===================== */

    @Builder.Default
    private Integer overdueDays = 0;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal latePenalty = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal brokenPenalty = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal lostPenalty = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal totalPenalty = BigDecimal.ZERO;

    /* ===================== STATUS FLAGS ===================== */

    @Builder.Default
    @Column(nullable = false)
    private boolean status = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean paid = false;

    /* ===================== AUDIT ===================== */

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /* ===================== LOGIC ===================== */

    /**
     * Re-calculates totals before saving to database.
     */
    public void updateCalculatedTotals() {
        // 1. Broken Penalty: $2.00 per page
        // Using BigDecimal.valueOf(long) for the multiplier
        int pages = (this.brokenPages != null) ? this.brokenPages : 0;
        this.brokenPenalty = BigDecimal.valueOf(pages).multiply(new BigDecimal("2.00"));

        // 2. Lost Penalty: Book Price (fallback to 50)
        // FIX: Since book.getPrice() is now BigDecimal, use it directly!
        if (this.lost && this.book != null) {
            this.lostPenalty = (this.book.getPrice() != null)
                    ? this.book.getPrice()
                    : new BigDecimal("50.00");
        } else {
            this.lostPenalty = BigDecimal.ZERO;
        }

        // 3. Total Sum Calculation
        // Use .add() for BigDecimal objects
        BigDecimal late = (this.latePenalty != null) ? this.latePenalty : BigDecimal.ZERO;
        BigDecimal broken = (this.brokenPenalty != null) ? this.brokenPenalty : BigDecimal.ZERO;
        BigDecimal lost = (this.lostPenalty != null) ? this.lostPenalty : BigDecimal.ZERO;

        this.totalPenalty = late.add(broken).add(lost);

        // 4. Sync Status
        if (this.paid) {
            this.status = true;
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        updateCalculatedTotals();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateCalculatedTotals();
    }
}