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
public class RentalCheckinRequest {

    @NotBlank(message = "Rental code is required")
    private String rentalCode;

    @NotNull(message = "Return date is required")
    private LocalDate returnDate;

    private Double totalHoursUsed;
}
