package org.wldu.webservices.enities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "table22")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(name = "name")
    private String name;

    @Column(name = "gender")

    private String gender;

    @Column(name = "address")

    private String address;

    @Column(name = "email")

    private String email;

    @Column(name = "phone")

    private String phone;

    @Column(name = "age")

    private int age;

    @Column(name = "department")

    private String department;

}
