package com.ola.olastore.dto;

public record LoginResponseDto (



        String message, UserDto user, String jwtToken


){
}
