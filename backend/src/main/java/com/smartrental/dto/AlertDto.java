package com.smartrental.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDto {
    private Long id;
    private Long assetId;
    private String alertType;
    private String severity;
    private String message;
    private Boolean acknowledged;
    private LocalDateTime createdAt;
}
