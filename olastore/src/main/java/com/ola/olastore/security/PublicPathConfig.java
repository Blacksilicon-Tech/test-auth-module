package com.ola.olastore.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;


@Configuration
public class PublicPathConfig {


    @Bean
    public List<String> publicPaths() {
        return List.of("/api/v1/contacts/**",
                "/api/v1/auth/**",
                "/error",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/v3/api-docs.yaml");

    }



}
