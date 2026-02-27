package com.ola.olastore.security;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "openapi")
public class OpenApiProperties {

    private String name;
    private String version;
    private String description;
}

