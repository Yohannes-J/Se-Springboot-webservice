package org.wldu.webservices.auths;

public class AssignRoleRequestDto {
    private Long userId; // ID of the user whose role will be changed
    private String role; // "USER" or "ADMIN"

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
