package org.wldu.webservices.enities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Data
@Table(name="students")

public class StudentsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "stud_id" )
    private Long id;

    @Column(name = "name")
    private  String name;

    @Column(name = "age")
    private int age;

    @Column(name = "department")
    private String department;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number")
    private String phone;


}
