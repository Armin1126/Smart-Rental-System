package com.smartrental.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rental_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRecord {

    @Id
    private String rentalId;
    
    private String equipmentId;
    private String type;
    private String siteId;
    private String checkInDate;
    private String checkOutDate;
    private String originalReturnDate;
    private String actualReturnDate;
    private Double engineHoursDay;
    private Double idleHoursDay;
    private Integer rentalDays;
    private String contractType;
    private String rentalStatus;
    private Boolean isExtended;
    private Integer extensionCount;
    private String lastOperatorId;

    private String customerName;
    private String customerCode;
}
