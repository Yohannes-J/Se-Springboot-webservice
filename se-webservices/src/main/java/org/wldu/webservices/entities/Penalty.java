package org.wldu.webservices.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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
    private Long penaltyId;
    private Long customerId;
    private  Long bookId;
    private Long borrowId;


    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;


    private String lateReturn;
    private  String lostBook;
    private  String brokenPage;


    private Double totalFine;
    private String status;


}
