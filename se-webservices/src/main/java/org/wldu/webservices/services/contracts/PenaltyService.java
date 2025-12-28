package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.BorrowBook;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.repositories.BorrowRepository;
import org.wldu.webservices.repositories.PenaltyRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final BorrowRepository borrowRepository;

    // Create or update penalty based on borrow
    public Penalty saveOrUpdatePenalty(Long borrowId, Penalty p) {
        BorrowBook borrow = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow not found"));

        Optional<Penalty> existing = penaltyRepository.findByBorrow(borrow);

        Penalty penalty;
        if (existing.isPresent()) {
            // Update
            penalty = existing.get();
            penalty.setBrokenPages(p.getBrokenPages());
            penalty.setLatePenalty(p.getLatePenalty());
            penalty.setLost(p.getLost());
            penalty.setLostPrice(p.getLostPrice());
            penalty.setTotalPenalty(
                    p.getLatePenalty() + p.getBrokenPages() * 2 + (p.getLost() ? p.getLostPrice() : 0)
            );
            penalty.setStatus(p.getStatus());
        } else {
            // Create
            penalty = Penalty.builder()
                    .borrow(borrow)
                    .customer(borrow.getCustomer())
                    .brokenPages(p.getBrokenPages())
                    .latePenalty(p.getLatePenalty())
                    .lost(p.getLost())
                    .lostPrice(p.getLostPrice())
                    .totalPenalty(
                            p.getLatePenalty() + p.getBrokenPages() * 2 + (p.getLost() ? p.getLostPrice() : 0)
                    )
                    .status(p.getStatus())
                    .build();
        }
        return penaltyRepository.save(penalty);
    }

    // Update status only
    public Penalty updateStatus(Long id, Boolean status) {
        Penalty penalty = penaltyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penalty not found"));
        penalty.setStatus(status);
        return penaltyRepository.save(penalty);
    }

    // Delete penalty
    public void deletePenalty(Long id) {
        penaltyRepository.deleteById(id);
    }

    // Get all penalties
    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }

    // Get penalties by customer
    public List<Penalty> getPenaltiesByCustomer(Long customerId) {
        return penaltyRepository.findByCustomerId(customerId);
    }
}
