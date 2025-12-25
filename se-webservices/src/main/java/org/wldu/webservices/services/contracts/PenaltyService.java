package org.wldu.webservices.services.contracts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wldu.webservices.entities.Penalty;
import org.wldu.webservices.entities.BorrowBook;
import org.wldu.webservices.repositories.PenaltyRepository;
import org.wldu.webservices.repositories.BorrowRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final BorrowRepository borrowBookRepository;

    /**
     * UPSERT BY BORROW ID
     */
    @Transactional
    public Penalty createOrUpdateFromBorrow(Long borrowId, Map<String, Object> updates) {
        Penalty penalty = penaltyRepository.findByBorrowBookId(borrowId)
                .stream().findFirst().orElseGet(() -> {
                    BorrowBook borrow = borrowBookRepository.findById(borrowId)
                            .orElseThrow(() -> new RuntimeException("Borrow record not found: " + borrowId));

                    return Penalty.builder()
                            .borrowBook(borrow)
                            .customer(borrow.getCustomer())
                            .book(borrow.getBook())
                            .brokenPages(0)
                            .lost(false)
                            .overdue(false)
                            // Use BigDecimal.ZERO instead of 0.0
                            .latePenalty(BigDecimal.ZERO)
                            .brokenPenalty(BigDecimal.ZERO)
                            .lostPenalty(BigDecimal.ZERO)
                            .totalPenalty(BigDecimal.ZERO)
                            .overdueDays(0)
                            .status(false)
                            .paid(false)
                            .build();
                });

        applyUpdates(penalty, updates);

        return penaltyRepository.save(penalty);
    }

    /**
     * Standard Partial Update (using Penalty ID)
     */
    @Transactional
    public Penalty partialUpdate(Long id, Map<String, Object> updates) {
        Penalty penalty = penaltyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penalty not found with id " + id));

        applyUpdates(penalty, updates);

        return penaltyRepository.save(penalty);
    }

    /**
     * Helper to map Map values to Entity fields.
     * Fixed to handle BigDecimal conversion.
     */
    private void applyUpdates(Penalty penalty, Map<String, Object> updates) {
        updates.forEach((key, value) -> {
            if (value == null) return;

            switch (key) {
                case "brokenPages" -> penalty.setBrokenPages(Integer.valueOf(value.toString()));
                case "lost" -> penalty.setLost(Boolean.parseBoolean(value.toString()));
                case "overdue" -> penalty.setOverdue(Boolean.parseBoolean(value.toString()));

                case "status" -> {
                    String statusValue = value.toString().toLowerCase();
                    boolean isPaid = statusValue.equals("paid") || statusValue.equals("resolved") || statusValue.equals("true");
                    penalty.setStatus(isPaid);
                    penalty.setPaid(isPaid);
                }

                // FIX: Convert String/Double from frontend safely to BigDecimal
                case "latePenalty" -> penalty.setLatePenalty(new BigDecimal(value.toString()));
                case "overdueDays" -> penalty.setOverdueDays(Integer.valueOf(value.toString()));
            }
        });

        // Ensure calculations are refreshed after updates are applied
        penalty.updateCalculatedTotals();
    }

    /* --- Standard CRUD Methods --- */

    @Transactional(readOnly = true)
    public List<Penalty> getAllPenalties() {
        List<Penalty> penalties = penaltyRepository.findAll();
        // Initialize lazy proxies if necessary and ensure totals are calculated
        penalties.forEach(p -> {
            if (p.getBorrowBook() != null) p.getBorrowBook().getId();
            p.updateCalculatedTotals();
        });
        return penalties;
    }

    public Penalty getPenalty(Long id) {
        Penalty penalty = penaltyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penalty not found with id " + id));
        penalty.updateCalculatedTotals();
        return penalty;
    }

    public void deletePenalty(Long id) {
        penaltyRepository.deleteById(id);
    }
}