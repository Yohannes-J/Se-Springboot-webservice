package org.wldu.webservices.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "digital_materials")
public class DigitalMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String fileName;
    private String fileType;
    private long fileSize;
    private boolean readable;

    private boolean downloadable;


    private LocalDateTime uploadAt;
}
