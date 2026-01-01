package org.wldu.webservices.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiError {

    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(status, error, message, path, LocalDateTime.now());
    }
}
