package com.smartrental.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Data Transfer Object for Asset API responses and requests.
 * TODO: Add field-level validation annotations during feature development.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDto {
    private Long id;
    private String assetCode;
    private String name;
    private String category;
    private String status;
    private BigDecimal dailyRate;
    private Double latitude;
    private Double longitude;
    private Long siteId;
}
