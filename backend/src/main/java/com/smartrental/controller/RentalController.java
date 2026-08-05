package com.smartrental.controller;

import com.smartrental.dto.RentalCheckinRequest;
import com.smartrental.dto.RentalCheckoutRequest;
import com.smartrental.dto.RentalRecordDto;
import com.smartrental.repository.RentalRecordRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@Tag(name = "Rental Operations API", description = "Check-Out dispatch and Check-In return processing endpoints")
public class RentalController {

    @Autowired
    private RentalRecordRepository rentalRecordRepository;

    @PostMapping("/checkout")
    @Operation(summary = "Check-Out and assign equipment to job site and operator")
    public ResponseEntity<RentalRecordDto> checkoutEquipment(@Valid @RequestBody RentalCheckoutRequest request) {
        RentalRecordDto response = RentalRecordDto.builder()
                .id(101L)
                .rentalCode("RNT-" + System.currentTimeMillis() % 10000)
                .assetId(request.getAssetId())
                .operatorId(request.getOperatorId())
                .siteId(request.getSiteId())
                .customerName(request.getCustomerName())
                .startDate(request.getStartDate())
                .status("ACTIVE")
                .totalAmount(BigDecimal.valueOf(1500.00))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/checkin")
    @Operation(summary = "Check-In and process equipment return inspection")
    public ResponseEntity<RentalRecordDto> checkinEquipment(@Valid @RequestBody RentalCheckinRequest request) {
        RentalRecordDto response = RentalRecordDto.builder()
                .id(101L)
                .rentalCode(request.getRentalCode())
                .endDate(request.getReturnDate())
                .status("COMPLETED")
                .build();

        return ResponseEntity.ok(response);
    }
}
