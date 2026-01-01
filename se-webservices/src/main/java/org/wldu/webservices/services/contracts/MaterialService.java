package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Materials;
import org.wldu.webservices.exception.BadRequestException;
import org.wldu.webservices.exception.ResourceNotFoundException;
import org.wldu.webservices.repositories.MaterialRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialsRepository;

    /* =======================
       GET ALL MATERIALS
       ======================= */
    public List<Materials> getAllMaterials() {
        return materialsRepository.findAll();
    }

    /* =======================
       GET MATERIAL BY ID
       ======================= */
    public Materials getMaterialById(Long id) {
        return materialsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Material not found with id " + id
                        )
                );
    }

    /* =======================
       ADD MATERIAL
       ======================= */
    public Materials addMaterial(Materials material) {

        if (material.getName() == null || material.getName().isBlank()) {
            throw new BadRequestException(
                    "Material name is required"
            );
        }

        return materialsRepository.save(material);
    }

    /* =======================
       UPDATE MATERIAL
       ======================= */
    public Materials updateMaterial(Long id, Materials updatedMaterial) {

        return materialsRepository.findById(id)
                .map(material -> {

                    material.setName(updatedMaterial.getName());
                    material.setImage(updatedMaterial.getImage());
                    material.setMaterial(updatedMaterial.getMaterial());
                    material.setQuantity(updatedMaterial.getQuantity());
                    material.setLocation(updatedMaterial.getLocation());
                    material.setBorrowable(updatedMaterial.getBorrowable());
                    material.setDescription(updatedMaterial.getDescription());

                    return materialsRepository.save(material);
                })
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Material not found with id " + id
                        )
                );
    }

    /* =======================
       DELETE MATERIAL
       ======================= */
    public void deleteMaterial(Long id) {

        if (!materialsRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Material not found with id " + id
            );
        }

        materialsRepository.deleteById(id);
    }
}
