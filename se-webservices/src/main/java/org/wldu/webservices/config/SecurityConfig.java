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
                // 🔥 CONNECT CORS TO SPRING SECURITY
                .cors()

                // 🔐 JWT = no CSRF
                .and()
                .csrf(csrf -> csrf.disable())

                // 🔐 Stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 🔐 AUTH RULES
                .authorizeHttpRequests(auth -> auth

                        // ✅ allow preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ public
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/user/register").permitAll()
                        .requestMatchers("/api/books/list").permitAll()
                        .requestMatchers("/api/books/fetch").permitAll()
                        .requestMatchers("/api/users/**").permitAll()

                        // 🔒 ADMIN only
                        .requestMatchers("/user/delete").hasRole("ADMIN")
                        .requestMatchers("/user/update").hasRole("ADMIN")

                        .requestMatchers("/api/books/addbook").hasRole("ADMIN")
                        .requestMatchers("/api/books/update/**").hasRole("ADMIN")
                        .requestMatchers("/api/books/delete/**").hasRole("ADMIN")

                        .requestMatchers("/api/borrow/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // 🔐 everything else
                        .anyRequest().authenticated()
                )

                // 🔐 JWT FILTER
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
