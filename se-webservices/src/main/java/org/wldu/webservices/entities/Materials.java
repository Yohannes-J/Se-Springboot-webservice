package org.wldu.webservices.entities;

import jakarta.persistence.*;

import lombok.Data;

@Entity
@Data
@Table(name = "materials")
public class Materials {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "name")
    private String name;


    @Column(name = "image")
    private String image ;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private  MaterialCategory material;

    @Column(name = "quantity")
    private Integer quantity;



    @Column(name = "location")
    private String location;


    @Column(name = "borrowable")
    private Boolean borrowable;


    @Column(name = "description")
    private String description;

}
