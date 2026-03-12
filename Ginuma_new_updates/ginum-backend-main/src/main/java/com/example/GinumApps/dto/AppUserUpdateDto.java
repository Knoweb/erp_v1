package com.example.GinumApps.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AppUserUpdateDto {
    @NotBlank(message = "Role is required")
    private String role;
}
