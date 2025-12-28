package org.wldu.webservices.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "penalties")
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "borrow_id", nullable = false)
    private BorrowBook borrow; // Borrow record

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private Integer brokenPages = 0;
    private Double latePenalty = 0.0;
    private Boolean lost = false;
    private Double lostPrice = 0.0;
    private Double totalPenalty = 0.0;

    private Boolean status = false; // Pending=false, Resolved=true

    private LocalDate createdAt = LocalDate.now();
}
