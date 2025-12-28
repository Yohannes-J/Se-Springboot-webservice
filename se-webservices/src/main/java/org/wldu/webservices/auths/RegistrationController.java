package org.wldu.webservices.auths;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class RegistrationController {

    private final UsersService userService;

    public RegistrationController(UsersService userService) {
        this.userService = userService;
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        Users user = userService.register(request);
        return ResponseEntity.ok("User created successfully with ID: " + user.getId());
    }

    // ================= GET ALL USERS =================
    @GetMapping("/getAllUsers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Users>> getAllUsers() {
        List<Users> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // ================= UPDATE USER =================
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody RegisterRequestDto request) {
        Users updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    // ================= DELETE USER =================
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ================= ASSIGN ROLE =================
    @PutMapping("/assign-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignRole(@RequestBody AssignRoleRequestDto request) {
        userService.assignRole(request.getUserId(), request.getRole());
        return ResponseEntity.ok("Role assigned successfully");
    }

    // ================= REVOKE ROLE =================
    @PutMapping("/revoke-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> revokeRole(@RequestBody AssignRoleRequestDto request) {
        userService.revokeRole(request.getUserId());
        return ResponseEntity.ok("Role revoked successfully");
    }

    // ================= RESET PASSWORD =================
    @PutMapping("/reset-password/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");
        userService.resetPassword(id, oldPassword, newPassword);
        return ResponseEntity.ok("Password reset successfully");
    }

    // ================= ACTIVATE USER =================
    @PutMapping("/activate/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok("User account activated successfully");
    }

    // ================= DEACTIVATE USER =================
    @PutMapping("/deactivate/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok("User account deactivated successfully");
    }


    @PutMapping("/toggle-activation/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleActivation(@PathVariable Long id) {
        userService.toggleActivation(id);
        return ResponseEntity.ok("User status updated successfully");
    }

}
