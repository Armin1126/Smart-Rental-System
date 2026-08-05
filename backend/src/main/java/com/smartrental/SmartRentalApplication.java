package com.smartrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartRentalApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartRentalApplication.class, args);
    }
}
