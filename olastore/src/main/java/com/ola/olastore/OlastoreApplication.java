package com.ola.olastore;

import com.ola.olastore.security.OpenApiProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(OpenApiProperties.class)
public class OlastoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(OlastoreApplication.class, args);
	}

}
