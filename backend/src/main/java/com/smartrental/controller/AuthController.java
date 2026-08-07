package com.smartrental.controller;

import com.smartrental.model.User;
import com.smartrental.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String password = payload.get("password");
            String fullName = payload.get("fullName");
            String role = payload.get("role");
            String companyName = payload.get("companyName");
            String customerCode = payload.get("customerCode");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email address is required."));
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required."));
            }

            String cleanEmail = email.trim().toLowerCase();

            if (userRepository.findByEmail(cleanEmail).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "An account with email '" + cleanEmail + "' already exists."));
            }

            String assignedRole = (role != null && "CUSTOMER".equalsIgnoreCase(role)) ? "CUSTOMER" : "DEALER";
            String assignedCompany = (companyName != null && !companyName.trim().isEmpty())
                    ? companyName.trim()
                    : ("DEALER".equals(assignedRole) ? "Caterpillar Fleet Management" : "Acme Construction Co.");

            String assignedCustCode = (customerCode != null && !customerCode.trim().isEmpty())
                    ? customerCode.trim().toUpperCase()
                    : ("DEALER".equals(assignedRole) ? "DEALER001" : "CUST-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());

            User newUser = User.builder()
                    .email(cleanEmail)
                    .password(passwordEncoder.encode(password.trim()))
                    .fullName(fullName != null ? fullName.trim() : ("DEALER".equals(assignedRole) ? "CAT Fleet Operations Manager" : "Site Operations Manager"))
                    .role(assignedRole)
                    .companyName(assignedCompany)
                    .customerCode(assignedCustCode)
                    .build();

            User savedUser = userRepository.save(newUser);

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "User account created and saved in database successfully.",
                    "user", savedUser,
                    "token", "token_" + savedUser.getId() + "_" + System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to register user: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }

        String cleanEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (password != null && (passwordEncoder.matches(password.trim(), user.getPassword()) || password.equals(user.getPassword()))) {
                return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "user", user,
                    "token", "token_" + user.getId() + "_" + System.currentTimeMillis()
                ));
            }
        }

        // Dynamic fallbacks for pre-defined tenant logins
        if ("dealer@cat.com".equalsIgnoreCase(cleanEmail) && "dealer123".equals(password)) {
            User dealer = User.builder()
                    .id(1L)
                    .email("dealer@cat.com")
                    .fullName("CAT Dealer Operations Manager")
                    .role("DEALER")
                    .companyName("Caterpillar Fleet Management")
                    .customerCode("DEALER001")
                    .build();
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "user", dealer, "token", "token_dealer"));
        }

        if ("customer@acme.com".equalsIgnoreCase(cleanEmail) && "customer123".equals(password)) {
            User customer = User.builder()
                    .id(2L)
                    .email("customer@acme.com")
                    .fullName("Acme Site Manager")
                    .role("CUSTOMER")
                    .companyName("Acme Construction Co.")
                    .customerCode("CUST001")
                    .build();
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "user", customer, "token", "token_acme"));
        }

        if ("customer@pacific.com".equalsIgnoreCase(cleanEmail) && "customer123".equals(password)) {
            User customer = User.builder()
                    .id(3L)
                    .email("customer@pacific.com")
                    .fullName("Pacific Infrastructure Director")
                    .role("CUSTOMER")
                    .companyName("Pacific Mining Ltd.")
                    .customerCode("CUST002")
                    .build();
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "user", customer, "token", "token_pacific"));
        }

        if ("customer@titan.com".equalsIgnoreCase(cleanEmail) && "customer123".equals(password)) {
            User customer = User.builder()
                    .id(4L)
                    .email("customer@titan.com")
                    .fullName("Titan Earthworks Lead")
                    .role("CUSTOMER")
                    .companyName("Titan Earthworks Ltd.")
                    .customerCode("CUST003")
                    .build();
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "user", customer, "token", "token_titan"));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials. Please verify your email and password."));
    }
}

