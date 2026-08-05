package com.smartrental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalCheckoutRequest {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    private Long operatorId;

    private Long siteId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;
}
