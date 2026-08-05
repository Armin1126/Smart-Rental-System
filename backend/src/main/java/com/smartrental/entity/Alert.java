package com.smartrental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Asset reference is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @NotBlank(message = "Alert type is required")
    private String alertType; // MAINTENANCE_DUE, OVERDUE_RETURN, GEOFENCE_BREACH, HIGH_TEMP, VIBRATION_ANOMALY

    @NotBlank(message = "Severity is required")
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    private String message;

    private Boolean acknowledged;

    private LocalDateTime acknowledgedAt;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (acknowledged == null) {
            acknowledged = false;
        }
    }
}
