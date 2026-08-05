package com.smartrental.util;

/**
 * Application-wide constants.
 * TODO: Add shared constant values during feature development.
 */
public final class AppConstants {

    private AppConstants() {
        // Utility class — prevent instantiation
    }

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "20";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIR = "asc";

    // Asset status values
    public static final String ASSET_STATUS_AVAILABLE = "AVAILABLE";
    public static final String ASSET_STATUS_RENTED = "RENTED";
    public static final String ASSET_STATUS_MAINTENANCE = "MAINTENANCE";

    // Rental status values
    public static final String RENTAL_STATUS_RESERVED = "RESERVED";
    public static final String RENTAL_STATUS_ACTIVE = "ACTIVE";
    public static final String RENTAL_STATUS_COMPLETED = "COMPLETED";
    public static final String RENTAL_STATUS_CANCELLED = "CANCELLED";

    // Alert severity values
    public static final String SEVERITY_LOW = "LOW";
    public static final String SEVERITY_MEDIUM = "MEDIUM";
    public static final String SEVERITY_HIGH = "HIGH";
    public static final String SEVERITY_CRITICAL = "CRITICAL";
}
