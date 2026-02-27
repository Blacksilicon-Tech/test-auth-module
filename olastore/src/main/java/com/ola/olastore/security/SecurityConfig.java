

package com.ola.olastore.security;

import com.ola.olastore.filter.JWTTokenValidatorFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.password.HaveIBeenPwnedRestApiPasswordChecker;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig  {

    private final List<String> publicPaths;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("Initializing SecurityFilterChain...");
        log.info("Public paths configured: {}", publicPaths);

        return http.csrf(csrf -> {
                    log.debug("Disabling CSRF for /h2-console/**");
                    csrf.ignoringRequestMatchers("/h2-console/**").disable();
                })
                .headers(headers -> {
                    log.debug("Configuring frame options: SAMEORIGIN");
                    headers.frameOptions(frame -> frame.sameOrigin());
                })
                .cors(corsConfig -> {
                    log.debug("Enabling CORS configuration");
                    corsConfig.configurationSource(configurationSource());
                })
                .authorizeHttpRequests((requests) -> {
                    publicPaths.forEach(path -> {
                        log.info("Permitting public path: {}", path);
                        requests.requestMatchers(path).permitAll();
                    });
                    log.info("Restricting /api/v1/admin/** to ADMIN role");
                     requests.requestMatchers("/api/v1/products/create").hasRole("ADMIN");
                    requests.requestMatchers("/api/v1/admin/**").hasRole("ADMIN");
                    log.info("Requiring USER or ADMIN role for all other requests");
                    requests.anyRequest().hasAnyRole("USER", "ADMIN");
                })
                .addFilterBefore(new JWTTokenValidatorFilter(publicPaths), BasicAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationProvider authenticationProvider) {
        log.info("Registering AuthenticationManager with custom AuthenticationProvider");
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("Using BCryptPasswordEncoder as default PasswordEncoder");
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CompromisedPasswordChecker compromisedPasswordChecker() {
        log.info("Registering HaveIBeenPwned password checker");
        return new HaveIBeenPwnedRestApiPasswordChecker();
    }

    public CorsConfigurationSource configurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        config.setAllowedMethods(Collections.singletonList("*"));
        config.setAllowedHeaders(Collections.singletonList("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        log.info("CORS configuration: origins={}, methods={}, headers={}",
                config.getAllowedOrigins(), config.getAllowedMethods(), config.getAllowedHeaders());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}




//package com.ola.olastore.security;
//
//import com.ola.olastore.filter.JWTTokenValidatorFilter;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.AuthenticationProvider;
//import org.springframework.security.authentication.ProviderManager;
//import org.springframework.security.authentication.password.CompromisedPasswordChecker;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.password.HaveIBeenPwnedRestApiPasswordChecker;
//import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//import java.util.Collections;
//import java.util.List;
//
//@Configuration
//@RequiredArgsConstructor
//@EnableWebSecurity
//public class SecurityConfig  {
//
//    private final List<String> publicPaths;
//
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        return http.csrf(csrf -> csrf
//                        .ignoringRequestMatchers("/h2-console/**")
//                        .disable()
//        )
//                .headers(headers -> headers
//                        .frameOptions(frame-> frame.sameOrigin())
//        )
//                .cors(corsConfig -> corsConfig.configurationSource(configurationSource()))
//                .authorizeHttpRequests((requests) -> {
//            publicPaths
//                    .forEach(path -> requests.requestMatchers(path).permitAll());
//            requests.requestMatchers("/api/v1/admin/**").hasRole("ADMIN");
//            requests.anyRequest().hasAnyRole("USER", "ADMIN");
//        })
//                .addFilterBefore(new JWTTokenValidatorFilter(publicPaths), BasicAuthenticationFilter.class)
//                .build();
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationProvider authenticationProvider) {
//        var providerManager = new ProviderManager(authenticationProvider);
//        return  providerManager;
//            }
//
//
//
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//
//
//    // compromised password checker
//    @Bean
//    public CompromisedPasswordChecker compromisedPasswordChecker(){
//        return new HaveIBeenPwnedRestApiPasswordChecker();
//    }
//
//
//    public CorsConfigurationSource configurationSource() {
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
//        config.setAllowedMethods(Collections.singletonList("*"));
//        config.setAllowedHeaders(Collections.singletonList("*"));
//        config.setAllowCredentials(true);
//        config.setMaxAge(3600l);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//        return source;
//    }
//
//
//
//}
