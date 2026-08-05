package com.smartrental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Site code is required")
    @Column(unique = true, nullable = false)
    private String siteCode;

    @NotBlank(message = "Site name is required")
    @Column(nullable = false)
    private String name;

    private String address;

    private String city;

    private String state;

    private String country;

    private Double latitude;

    private Double longitude;

    private String status; // ACTIVE, INACTIVE

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
