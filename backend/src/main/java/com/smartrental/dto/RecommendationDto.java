package com.smartrental.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDto {
    private Long id;
    private Long assetId;
    private String recommendationType;
    private String title;
    private String description;
    private Double confidenceScore;
    private String impactScore;
    private LocalDateTime createdAt;
}
