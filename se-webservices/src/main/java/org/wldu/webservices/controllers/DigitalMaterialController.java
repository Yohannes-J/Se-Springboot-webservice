package org.wldu.webservices.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.wldu.webservices.entities.DigitalMaterial;
import org.wldu.webservices.services.contracts.DigitalMaterialService;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/digital-materials")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DigitalMaterialController {

    private final DigitalMaterialService service;

    /* =========================
       UPLOAD (ADMIN ONLY)
       ========================= */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DigitalMaterial> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam boolean readable,
            @RequestParam boolean downloadable
    ) throws Exception {

        DigitalMaterial material = service.upload(
                file,
                title,
                description,
                readable,
                downloadable
        );

        return ResponseEntity.ok(material);
    }

    /* =========================
       GET ALL (PUBLIC)
       ========================= */
    @GetMapping("/getAll")
    public ResponseEntity<List<DigitalMaterial>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /* =========================
       VIEW / READ (READABLE ONLY)
       ========================= */
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> view(@PathVariable Long id) throws Exception {

        DigitalMaterial material = service.getById(id);

        if (!material.isReadable()) {
            return ResponseEntity.status(403).build();
        }

        Path path = service.loadFile(id);
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, material.getFileType())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + material.getFileName() + "\"")
                .body(resource);
    }

    /* =========================
       DOWNLOAD (DOWNLOADABLE ONLY)
       ========================= */
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws Exception {

        DigitalMaterial material = service.getById(id);

        if (!material.isDownloadable()) {
            return ResponseEntity.status(403).build();
        }

        Path path = service.loadFile(id);
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + material.getFileName() + "\"")
                .body(resource);
    }

    /* =========================
       DELETE (ADMIN ONLY)
       ========================= */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws Exception {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
