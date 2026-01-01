package dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReservationRequest {

    private Long customerId;
    private Long bookId;
    private LocalDateTime expiryDate;
    private String status; // PENDING, CANCELLED, FULFILLED
}
