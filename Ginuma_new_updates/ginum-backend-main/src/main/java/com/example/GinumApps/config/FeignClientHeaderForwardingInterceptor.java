package com.example.GinumApps.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Forwards selected incoming HTTP headers to outbound Feign requests so downstream
 * services (inventory) receive the same tenant/auth context.
 */
@Component
public class FeignClientHeaderForwardingInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes)) return;

        HttpServletRequest request = ((ServletRequestAttributes) attrs).getRequest();
        if (request == null) return;

        // Forward Authorization if present
        String auth = request.getHeader("Authorization");
        if (auth != null && !auth.isBlank()) {
            template.header("Authorization", auth);
        }

        // Forward tenant and org headers (case-insensitive)
        copyHeaderIfPresent(request, template, "x-org-id");
        copyHeaderIfPresent(request, template, "x-tenant-id");
        copyHeaderIfPresent(request, template, "x-industry-type");
    }

    private void copyHeaderIfPresent(HttpServletRequest request, RequestTemplate template, String headerName) {
        String val = request.getHeader(headerName);
        if (val == null) {
            // try different casing
            val = request.getHeader(headerName.toUpperCase());
        }
        if (val != null && !val.isBlank()) {
            template.header(headerName, val);
        }
    }
}
