package org.wldu.webservices.auths;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsersService {

    private final UsersRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UsersService(UsersRepository userRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ================= REGISTER =================
    public Users register(RegisterRequestDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(resolveRole(request.getRole()));
        user.setActive(true);

        return userRepository.save(user);
    }

    // ================= GET ALL =================
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    // ================= UPDATE =================
    public Users updateUser(Long id, RegisterRequestDto request) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(resolveRole(request.getRole()));

        return userRepository.save(user);
    }

    // ================= DELETE =================
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    // ================= ROLE MANAGEMENT =================
    public void assignRole(Long userId, String role) {
        Users user = getUserById(userId);
        user.setRole(resolveRole(role));
        userRepository.save(user);
    }

    public void revokeRole(Long userId) {
        Users user = getUserById(userId);
        user.setRole("ROLE_USER"); // default role
        userRepository.save(user);
    }

    // ================= ACCOUNT STATUS =================
    public void activateUser(Long userId) {
        Users user = getUserById(userId);
        user.setActive(true);
        userRepository.save(user);
    }

    public void deactivateUser(Long userId) {
        Users user = getUserById(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    // ================= REST PASSWORD  =================
    public void resetPassword(Long userId, String oldPassword, String newPassword) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }


    // ================= HELPER METHODS =================
    private Users getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String resolveRole(String role) {
        if (role == null) return "ROLE_USER";

        switch (role.toUpperCase()) {
            case "ADMIN":
                return "ROLE_ADMIN";
            case "LIBRARIAN":
                return "ROLE_LIBRARIAN";
            default:
                return "ROLE_USER";
        }
    }

    public void toggleActivation(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(!user.isActive()); // switch state
        userRepository.save(user);
    }

}
