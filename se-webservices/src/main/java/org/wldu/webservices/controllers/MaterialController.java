package org.wldu.webservices.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.wldu.webservices.entities.Materials;
import org.wldu.webservices.repositories.MaterialRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "http://localhost:5173") // Allow your frontend
public class MaterialController {

    private final MaterialRepository materialsRepository;

    public MaterialController(MaterialRepository materialsRepository) {
        this.materialsRepository = materialsRepository;
    }

    // GET all materials
    @GetMapping
    public List<Materials> getAllMaterials() {
        return materialsRepository.findAll();
    }

    // GET material by ID
    @GetMapping("/{id}")
    public ResponseEntity<Materials> getMaterialById(@PathVariable Long id) {
        Optional<Materials> material = materialsRepository.findById(id);
        return material.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // CREATE material with optional image upload
    @PostMapping
    public ResponseEntity<Materials> createMaterial(
            @RequestPart("material") Materials material,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            Path path = Paths.get("uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, imageFile.getBytes());
            material.setImage(fileName);
        }

        Materials saved = materialsRepository.save(material);
        return ResponseEntity.ok(saved);
    }

    // UPDATE material with optional new image
    @PutMapping("/{id}")
    public ResponseEntity<Materials> updateMaterial(
            @PathVariable Long id,
            @RequestPart("material") Materials materialDetails,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {

        Optional<Materials> optionalMaterial = materialsRepository.findById(id);
        if (!optionalMaterial.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Materials material = optionalMaterial.get();
        material.setName(materialDetails.getName());
        material.setMaterial(materialDetails.getMaterial());
        material.setQuantity(materialDetails.getQuantity());
        material.setLocation(materialDetails.getLocation());
        material.setBorrowable(materialDetails.getBorrowable());
        material.setDescription(materialDetails.getDescription());

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            Path path = Paths.get("uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, imageFile.getBytes());
            material.setImage(fileName);
        }

        Materials updated = materialsRepository.save(material);
        return ResponseEntity.ok(updated);
    }

    // DELETE material
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        if (!materialsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        materialsRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
