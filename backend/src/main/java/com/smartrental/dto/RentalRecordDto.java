package com.smartrental.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRecordDto {
    private Long id;
    private String rentalCode;
    private Long assetId;
    private Long operatorId;
    private Long siteId;
    private String customerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private String status;
}
