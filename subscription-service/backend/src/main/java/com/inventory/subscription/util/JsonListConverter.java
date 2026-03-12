package com.inventory.subscription.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Converter for JSON array column
 * Converts between List<String> and JSON string for subscribed_systems column
 * 
 * Usage: Maps database JSON column to Java List<String>
 * Example DB value: ["GINUMA", "INVENTORY"]
 * Example Java value: List.of("GINUMA", "INVENTORY")
 */
@Slf4j
@Converter(autoApply = false)
public class JsonListConverter implements AttributeConverter<List<String>, String> {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Convert List<String> to JSON string for database storage
     */
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            log.error("Error converting list to JSON: {}", e.getMessage());
            return "[]";
        }
    }
    
    /**
     * Convert JSON string from database to List<String>
     */
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty() || "[]".equals(dbData)) {
            return new ArrayList<>();
        }
        
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON to list: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
}
