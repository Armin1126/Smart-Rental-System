package com.smartrental.dto;

import lombok.*;

/**
 * Data Transfer Object for Site API responses and requests.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteDto {
    private Long id;
    private String siteCode;
    private String name;
    private String address;
    private String city;
    private String state;
    private String country;
    private Double latitude;
    private Double longitude;
    private String status;
}
