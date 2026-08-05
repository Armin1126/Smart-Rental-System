package com.smartrental.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for Rental API responses and requests.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalDto {
    private Long id;
    private String rentalCode;
    private Long assetId;
    private Long operatorId;
    private String customerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private String status;
}
