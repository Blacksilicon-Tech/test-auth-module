package com.ola.olastore.security;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@RequiredArgsConstructor
@Configuration
public class OpenApiConfig {


    private final  OpenApiProperties properties;


    @Bean
    public OpenApiCustomizer customOpenApiDefaultStringValue() {
        return openApi -> {
            openApi
                    .getComponents()
                    .getSchemas()
                    .values()
                    .forEach(
                            schema -> {
                                @SuppressWarnings("unchecked")
                                Map<String, Schema<?>> properties =
                                        schema.getProperties();
                                if (properties != null) {
                                    properties.forEach(
                                            (name, property) -> {
                                                if("string".equals(property.getType()) && property.getExample() == null) {
                                                    property.setExample(StringUtils.EMPTY);
                                                }
                                            }
                                    );
                                }
                            }
                    );
        };
    }

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        final String apiTitle = String.format("%s API", StringUtils.capitalize(properties.getName()));

        var info = new Info()
                .title(apiTitle)
                .version(properties.getVersion())
                .description(properties.getDescription())
                .contact(new Contact()
                        .name("Ola support team")
                        .url("https://Ola.com)" )
                        .email("olaitanjames141@gmail.com"))
                .license(new License()
                        .name("Apache 2.0")
                        .url("https://wwww.apache.org/licenses/LICENSE-2.0"));
        var securityScheme =
                new SecurityScheme()
                        .name(securitySchemeName)
                        .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT");

        var components = new Components().addSecuritySchemes(securitySchemeName, securityScheme);

        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(components)
                .info(info);
    }






}
