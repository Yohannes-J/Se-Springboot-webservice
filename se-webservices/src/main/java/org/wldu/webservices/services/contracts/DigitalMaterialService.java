package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.wldu.webservices.config.FileStorageProperties;
import org.wldu.webservices.entities.DigitalMaterial;
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

    // Upload file + save metadata
    public DigitalMaterial upload(
            MultipartFile file,
            String title,
            String description,
            boolean readable,
            boolean downloadable
    ) throws IOException {

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
    }

    public List<DigitalMaterial> getAll() {
        return repository.findAll();
    }

    public DigitalMaterial getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Digital Material not found"));
    }

    public Path loadFile(Long id) {
        DigitalMaterial material = getById(id);
        return Paths.get(fileStorageProperties.getUploadDir())
                .resolve(material.getFileName());
    }

    public void delete(Long id) throws IOException {
        DigitalMaterial material = getById(id);
        Path filePath = loadFile(id);
        Files.deleteIfExists(filePath);
        repository.delete(material);
    }
}
