package org.wldu.webservices.enities;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name="address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id" )
    private UUID id;

    @Column(name = "email")
    private  String email;


    @Column(name = "phone")
    private int phone;


    @Column(name = "region")
    private String region;


    @Column(name = "zone")

    private String zone;


    @Column(name = "stud_id")

    private UUID stud_id;



}
