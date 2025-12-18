package org.wldu.webservices.services.contracts;

import org.springframework.stereotype.Service;
import org.wldu.webservices.enities.User;
import org.wldu.webservices.repositories.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Add new user
    public User addUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (user.getRole() == null) {
            user.setRole("MEMBER");
        }

        return userRepository.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    // Update user
    public User updateUser(Long id, User updatedUser) {

        return userRepository.findById(id).map(user -> {

            user.setName(updatedUser.getName());
            user.setRole(updatedUser.getRole());

            // prevent updating email to existing one
            if (!user.getEmail().equals(updatedUser.getEmail())) {
                if (userRepository.existsByEmail(updatedUser.getEmail())) {
                    throw new RuntimeException("Email already exists");
                }
                user.setEmail(updatedUser.getEmail());
            }

            return userRepository.save(user);

        }).orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    // Delete user
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id " + id);
        }
        userRepository.deleteById(id);
    }

    // Search by name
    public List<User> searchByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name);
    }

    // Search by email
    public List<User> searchByEmail(String email) {
        return userRepository.findByEmailContainingIgnoreCase(email);
    }
}
