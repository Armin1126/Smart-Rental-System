package com.smartrental.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "operators")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Operator {

    @Id
    private String operatorId;
    
    private String firstName;
    private String lastName;
    private String licenseType;
    private String licenseExpiry;
    private Integer yearsExperience;
    private String assignedSite;
    private String status;
    private String certificationLevel;
    private Integer incidentCount;

}
