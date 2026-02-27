package com.ola.olastore.service.impl;


import com.fasterxml.jackson.databind.util.BeanUtil;
import com.ola.olastore.dto.*;
import com.ola.olastore.entity.Customer;
import com.ola.olastore.entity.Role;
import com.ola.olastore.repository.CustomerRepository;
import com.ola.olastore.repository.RoleRepository;
import com.ola.olastore.service.IAuthService;
import com.ola.olastore.utill.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.authentication.password.CompromisedPasswordDecision;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class AuthServiceImpl implements IAuthService {
    //injected during registration

    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final CompromisedPasswordChecker compromisedPasswordChecker;
    private  final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        log.info("Attempting login for username: {}", loginRequestDto.username());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.username(),
                        loginRequestDto.password()
                )
        );

        var loggInUser = (Customer) authentication.getPrincipal();

        var userDto = new UserDto();
        BeanUtils.copyProperties(loggInUser, userDto);
        userDto.setRoles(authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(",")));

        if (loggInUser.getAddress() != null) {
            var addressDto = new AddressDto();
            BeanUtils.copyProperties(loggInUser.getAddress(), addressDto);
            userDto.setAddress(addressDto);
        }

        String jwtToken = jwtUtil.generateJwtToken(authentication);
        log.info("Authenticatation successful for user: {}", authentication.getName());

        return  new LoginResponseDto("OK" , userDto,jwtToken);
    }


    @Override
    public RegisterResponseDto register(RegisterRequestDto registerRequestDto) {
        CompromisedPasswordDecision decision = compromisedPasswordChecker.check(registerRequestDto.getPasswordHash());
        if (decision.isCompromised()) {
            return  new RegisterResponseDto("Choose a strong password");
        }

        Optional<Customer> existingCustomer = customerRepository.findByEmailOrMobileNumber(
                registerRequestDto.getEmail(),
                registerRequestDto.getMobileNumber()
        );

        if (existingCustomer.isPresent()) {
            throw new IllegalArgumentException("Email or mobile number already registered");
        }

        Customer customer = new Customer();
        BeanUtils.copyProperties(registerRequestDto, customer);
        customer.setPasswordHash(passwordEncoder.encode(registerRequestDto.getPasswordHash()));

        Role role= roleRepository.findByName("ROLE_USER").orElseThrow(()-> new RuntimeException("Default role not found in database"));

        customer.setRoles(Set.of(role));
        customerRepository.save(customer);

        return new RegisterResponseDto("Registration successsfull");
    }
}

