package org.wldu.webservices.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.wldu.webservices.auths.Users;
import org.wldu.webservices.auths.UsersRepository;

@Component
@RequiredArgsConstructor
public class MainAdminInitializer implements CommandLineRunner {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.main-admin.username}")
    private String adminUsername;

    @Value("${app.main-admin.password}")
    private String adminPassword;

    @Value("${app.main-admin.role}")
    private String adminRole;

    @Override
    public void run(String... args) {

        if (!usersRepository.existsByUsername(adminUsername)) {

            Users admin = new Users();
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(adminRole);
            admin.setActive(true);

            usersRepository.save(admin);

            System.out.println("✅ MAIN ADMIN CREATED");
        } else {
            System.out.println("ℹ️ MAIN ADMIN ALREADY EXISTS");
        }
    }
}
