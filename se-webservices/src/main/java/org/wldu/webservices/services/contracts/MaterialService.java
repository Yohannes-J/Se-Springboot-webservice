package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Materials;
import org.wldu.webservices.repositories.MaterialRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialsRepository;

    // Get all materials
    public List<Materials> getAllMaterials() {
        return materialsRepository.findAll();
    }

    // Get material by ID
    public Optional<Materials> getMaterialById(Long id) {
        return materialsRepository.findById(id);
    }

    // Add new material
    public Materials addMaterial(Materials material) {
        return materialsRepository.save(material);
    }

    // Update material
    public Materials updateMaterial(Long id, Materials updatedMaterial) {
        return materialsRepository.findById(id).map(material -> {
            material.setName(updatedMaterial.getName());
            material.setImage(updatedMaterial.getImage());
            material.setMaterial(updatedMaterial.getMaterial());
            material.setQuantity(updatedMaterial.getQuantity());
            material.setLocation(updatedMaterial.getLocation());
            material.setBorrowable(updatedMaterial.getBorrowable());
            material.setDescription(updatedMaterial.getDescription());
            return materialsRepository.save(material);
        }).orElseThrow(() -> new RuntimeException("Material not found with id " + id));
    }

    // Delete material
    public void deleteMaterial(Long id) {
        materialsRepository.deleteById(id);
    }
}
