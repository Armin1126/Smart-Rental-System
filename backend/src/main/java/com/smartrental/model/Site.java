package com.smartrental.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

    @Id
    private String siteId;
    
    private String siteName;
    private String location;
    private Double latitude;
    private Double longitude;
    private String managerName;
    private String contactPhone;
    private String projectType;
    private String startDate;
    private String endDate;
    private String status;

}
