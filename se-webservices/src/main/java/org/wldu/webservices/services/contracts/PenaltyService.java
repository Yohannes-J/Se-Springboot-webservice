package org.wldu.webservices.services.contracts;

import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.repositories.PenaltyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;

    public PenaltyService(PenaltyRepository penaltyRepository) {
        this.penaltyRepository = penaltyRepository;
    }

    public Penalty addPenalty(Penalty penalty) {
        return penaltyRepository.save(penalty);
    }

    public Penalty updatePenalty(Long id, Penalty updatedPenalty) {
        Optional<Penalty> existing = penaltyRepository.findById(id);
        if (existing.isEmpty()) {
            throw new RuntimeException("Penalty not found with id " + id);
        }

        Penalty penalty = existing.get();
        penalty.setAmount(updatedPenalty.getAmount());
        penalty.setPaid(updatedPenalty.isPaid());
        penalty.setReason(updatedPenalty.getReason());

        if (updatedPenalty.getCustomer() != null) penalty.setCustomer(updatedPenalty.getCustomer());
        if (updatedPenalty.getBook() != null) penalty.setBook(updatedPenalty.getBook());
        if (updatedPenalty.getBorrowBook() != null) penalty.setBorrowBook(updatedPenalty.getBorrowBook());

        return penaltyRepository.save(penalty);
    }

    public void deletePenalty(Long id) {
        penaltyRepository.deleteById(id);
    }

    public Penalty getPenalty(Long id) {
        return penaltyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penalty not found with id " + id));
    }

    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }

    public List<Penalty> getPenaltiesByCustomer(Long customerId) {
        return penaltyRepository.findByCustomerId(customerId);
    }

    public List<Penalty> getPenaltiesByBook(Long bookId) {
        return penaltyRepository.findByBookId(bookId);
    }

    public List<Penalty> getPenaltiesByBorrowBook(Long borrowBookId) {
        return penaltyRepository.findByBorrowBookId(borrowBookId);
    }
}
