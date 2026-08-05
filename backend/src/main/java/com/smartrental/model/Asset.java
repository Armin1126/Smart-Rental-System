package com.smartrental.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    private String equipmentId;
    
    private String equipmentType;
    private String make;
    private String model;
    private Integer manufactureYear;
    private String purchaseDate;
    private String currentSite;
    private String status;
    private Double dailyRentalRate;
    private Double currentValue;
    private Integer expectedLifespanYears;
    private Double engineHours;
    private Double idleHours;

}
