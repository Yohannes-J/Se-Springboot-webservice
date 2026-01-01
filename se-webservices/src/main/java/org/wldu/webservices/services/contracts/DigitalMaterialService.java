package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.wldu.webservices.config.FileStorageProperties;
import org.wldu.webservices.entities.DigitalMaterial;
import org.wldu.webservices.exception.BadRequestException;
import org.wldu.webservices.exception.ResourceNotFoundException;
import org.wldu.webservices.repositories.DigitalMaterialRepository;


import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DigitalMaterialService {

    private final DigitalMaterialRepository repository;
    private final FileStorageProperties fileStorageProperties;

    /* =======================
       UPLOAD DIGITAL MATERIAL
       ======================= */
    public DigitalMaterial upload(
            MultipartFile file,
            String title,
            String description,
            boolean readable,
            boolean downloadable
    ) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException(
                    "Uploaded file is empty"
            );
        }

        try {
            Path uploadPath = Paths.get(fileStorageProperties.getUploadDir());
            Files.createDirectories(uploadPath);

            String storedFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(storedFileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            DigitalMaterial material = new DigitalMaterial();
            material.setTitle(title);
            material.setDescription(description);
            material.setFileName(storedFileName);
            material.setFileType(file.getContentType());
            material.setFileSize(file.getSize());
            material.setReadable(readable);
            material.setDownloadable(downloadable);
            material.setUploadAt(LocalDateTime.now());

            return repository.save(material);

        } catch (IOException ex) {
            throw new BadRequestException(
                    "Failed to upload file"
            );
        }
    }

    /* =======================
       GET ALL MATERIALS
       ======================= */
    public List<DigitalMaterial> getAll() {
        return repository.findAll();
    }

    /* =======================
       GET BY ID
       ======================= */
    public DigitalMaterial getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Digital material not found with id: " + id
                        )
                );
    }

    /* =======================
       LOAD FILE PATH
       ======================= */
    public Path loadFile(Long id) {

        DigitalMaterial material = getById(id);

        Path filePath = Paths.get(fileStorageProperties.getUploadDir())
                .resolve(material.getFileName());

        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException(
                    "File not found on server"
            );
        }

        return filePath;
    }

    /* =======================
       DELETE MATERIAL
       ======================= */
    public void delete(Long id) {

        DigitalMaterial material = getById(id);
        Path filePath = loadFile(id);

        try {
            Files.deleteIfExists(filePath);
            repository.delete(material);
        } catch (IOException ex) {
            throw new BadRequestException(
                    "Failed to delete digital material"
            );
        }
    }
}
