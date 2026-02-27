
package com.ola.olastore.controller;

import com.ola.olastore.dto.LoginRequestDto;
import com.ola.olastore.dto.LoginResponseDto;
import com.ola.olastore.dto.RegisterRequestDto;
import com.ola.olastore.dto.RegisterResponseDto;
import com.ola.olastore.service.IAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> apiLogin(@RequestBody LoginRequestDto loginRequestDto) {
        return ResponseEntity.ok(authService.login(loginRequestDto));
    }



    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> registerUser(@RequestBody RegisterRequestDto registerRequestDto) {
        log.info("Received register request for email: {}", registerRequestDto.getEmail());

        RegisterResponseDto registerResponseDto = authService.register(registerRequestDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponseDto);
    }
}
