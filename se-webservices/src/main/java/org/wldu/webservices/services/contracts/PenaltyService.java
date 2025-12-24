package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.repositories.PenaltyRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;

    /* =====================================================
       CREATE PENALTY
       ===================================================== */
    public Penalty addPenalty(Penalty penalty) {
        return penaltyRepository.save(penalty);
    }

    /* =====================================================
       UPDATE PENALTY
       ===================================================== */
    public Penalty updatePenalty(Long id, Penalty updatedPenalty) {

        Penalty penalty = penaltyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Penalty not found with id " + id));

        /* ---------- Relations ---------- */
        if (updatedPenalty.getCustomer() != null)
            penalty.setCustomer(updatedPenalty.getCustomer());

        if (updatedPenalty.getBook() != null)
            penalty.setBook(updatedPenalty.getBook());

        if (updatedPenalty.getBorrowBook() != null)
            penalty.setBorrowBook(updatedPenalty.getBorrowBook());

        /* ---------- Penalty Breakdown ---------- */
        penalty.setOverdueDays(updatedPenalty.getOverdueDays());
        penalty.setLatePenalty(updatedPenalty.getLatePenalty());
        penalty.setBrokenPenalty(updatedPenalty.getBrokenPenalty());
        penalty.setLostPenalty(updatedPenalty.getLostPenalty());
        penalty.setTotalPenalty(updatedPenalty.getTotalPenalty());

        /* ---------- Status ---------- */
        penalty.setPaid(updatedPenalty.isPaid());
        penalty.setResolved(updatedPenalty.isResolved());

        return penaltyRepository.save(penalty);
    }

    /* =====================================================
       DELETE PENALTY
       ===================================================== */
    public void deletePenalty(Long id) {
        if (!penaltyRepository.existsById(id)) {
            throw new RuntimeException("Penalty not found with id " + id);
        }
        penaltyRepository.deleteById(id);
    }

    /* =====================================================
       GET PENALTY BY ID
       ===================================================== */
    public Penalty getPenalty(Long id) {
        return penaltyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Penalty not found with id " + id));
    }

    /* =====================================================
       GET ALL PENALTIES
       ===================================================== */
    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }

    /* =====================================================
       GET PENALTIES BY CUSTOMER
       ===================================================== */
    public List<Penalty> getPenaltiesByCustomer(Long customerId) {
        return penaltyRepository.findByCustomerId(customerId);
    }

    /* =====================================================
       GET PENALTIES BY BOOK
       ===================================================== */
    public List<Penalty> getPenaltiesByBook(Long bookId) {
        return penaltyRepository.findByBookId(bookId);
    }

    /* =====================================================
       GET PENALTIES BY BORROW RECORD
       ===================================================== */
    public List<Penalty> getPenaltiesByBorrowBook(Long borrowBookId) {
        return penaltyRepository.findByBorrowBookId(borrowBookId);
    }
}
