package org.wldu.webservices.enities;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name="course")
public class Courses {

    @Id
    @GeneratedValue

    @Column(name = "course_id" )
    private UUID id;


    @Column(name = "Title")
    private String title;

    @Column(name = "code")
     private String courseCode;


    @Column(name = "ects")
    private int ects;


    @Column(name = "department_id")
    private int departmentId;

    @Column(name = "year")
    private String year;

    @Column(name = "semester")
    private int semester;

}
