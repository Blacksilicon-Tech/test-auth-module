package com.ola.olastore.service;


import com.ola.olastore.dto.LoginRequestDto;
import com.ola.olastore.dto.LoginResponseDto;
import com.ola.olastore.dto.RegisterRequestDto;
import com.ola.olastore.dto.RegisterResponseDto;
import org.springframework.http.ResponseEntity;

public interface IAuthService {
  LoginResponseDto login(LoginRequestDto loginRequestDto);
  RegisterResponseDto register(RegisterRequestDto registerRequestDto);
}
