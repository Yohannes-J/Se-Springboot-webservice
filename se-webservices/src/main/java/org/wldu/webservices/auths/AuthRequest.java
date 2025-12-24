package org.wldu.webservices.auths;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// --- Request DTO ---
@Data
@NoArgsConstructor
@AllArgsConstructor
class AuthRequest {
    private String username;
    private String password;
}

// --- Response DTO ---
@Data
@NoArgsConstructor // Required for JSON serialization
class AuthResponse {
    private String token;
    private Users user; // The missing piece that carries the ROLE

    // Constructor to match: return ResponseEntity.ok(new AuthResponse(token, user));
    public AuthResponse(String token, Users user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }
}