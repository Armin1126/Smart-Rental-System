package com.smartrental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Asset code is required")
    @Column(unique = true, nullable = false)
    private String assetCode;

    @NotBlank(message = "Asset name is required")
    @Column(nullable = false)
    private String name;

    private String category;

    private String status; // AVAILABLE, RENTED, MAINTENANCE

    @NotNull(message = "Daily rate is required")
    private BigDecimal dailyRate;

    private Double latitude;

    private Double longitude;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "AVAILABLE";
        }
    }
}
