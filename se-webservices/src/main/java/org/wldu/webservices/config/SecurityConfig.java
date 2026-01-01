package org.wldu.webservices.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.wldu.webservices.auths.CustomUserDetailsService;
import org.wldu.webservices.auths.JwtAuthFilter;
import org.wldu.webservices.auths.JwtUtil;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthFilter jwtAuthFilter(
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService
    ) {
        return new JwtAuthFilter(jwtUtil, userDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/user/register").permitAll()
                        .requestMatchers("/api/books/list").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/books/fetch").permitAll()
                        .requestMatchers("/api/digital-materials/**").permitAll()
                        .requestMatchers("/api/customers/**").permitAll()
                        .requestMatchers("/api/user/delete").hasRole("ADMIN")
                        .requestMatchers("/api/user/update").hasRole("ADMIN")
                        .requestMatchers("/api/user/getAllUsers").hasRole("ADMIN")
                        .requestMatchers("/api/user/activate/**").hasRole("ADMIN")
                        .requestMatchers("/api/user/deactivate/**").hasRole("ADMIN")
                        .requestMatchers("/api/user/reset-password/**").hasRole("ADMIN")
                        .requestMatchers("/api/user/revoke-role").hasRole("ADMIN")
                        .requestMatchers("/api/user/toggle-activation").hasRole("ADMIN")


                        .requestMatchers("/api/books/addbook").hasRole("ADMIN")
                        .requestMatchers("/api/books/update/**").hasRole("ADMIN")
                        .requestMatchers("/api/books/delete/**").hasRole("ADMIN")
                        .requestMatchers("/api/borrow/**").hasAnyRole("ADMIN", "LIBRARIAN")
                        // Digital materials endpoints
                        .requestMatchers("/api/digital-materials/upload").hasRole("ADMIN")
                        .requestMatchers("/api/digital-materials/getAll").permitAll()
                        .requestMatchers("/api/digital-materials/download/**").permitAll()
                        .requestMatchers("/api/digital-materials/view/**").permitAll()

                        .requestMatchers("/api/digital-materials/delete/**").hasRole("ADMIN")

                        .requestMatchers("/api/reservations/**").permitAll()



                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/penalties/**")
                        .hasAnyRole("ADMIN", "LIBRARIAN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}
