package org.wldu.webservices.enities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "department")
    private String department;

    @ManyToOne
    @JoinColumn(name = "stud_id")
    private StudentsEntity student;
}
