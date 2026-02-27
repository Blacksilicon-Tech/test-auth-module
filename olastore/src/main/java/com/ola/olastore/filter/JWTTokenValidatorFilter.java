
package com.ola.olastore.filter;

import com.ola.olastore.constant.ApplicationConstant;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JWTTokenValidatorFilter extends OncePerRequestFilter {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final List<String> publicPaths;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        log.debug("Processing request path: {}", path);

        String authHeader = request.getHeader(ApplicationConstant.JWT_HEADER);
        if (authHeader != null) {
            log.debug("Found Authorization header for path {}: {}", path, authHeader);

            try {
                authHeader = authHeader.trim();
                if (!authHeader.startsWith("Bearer ")) {
                    log.warn("Invalid Authorization header format on path {}: {}", path, authHeader);
                    throw new BadCredentialsException("Missing 'Bearer' prefix");
                }

                String[] parts = authHeader.split("\\s+");
                String jwt = parts[parts.length - 1];

                Environment env = getEnvironment();
                if (env != null) {
                    String secret = env.getProperty(
                            ApplicationConstant.JWT_SECRET_KEY,
                            ApplicationConstant.JWT_SECRET_DEFAULT_VALUE
                    );
                    log.debug("Using secret from env, length: {}", secret.length());

                    SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
                    Claims claims = Jwts.parser()
                            .verifyWith(secretKey)
                            .build()
                            .parseSignedClaims(jwt)
                            .getPayload();

                    String username = String.valueOf(claims.get("email"));
                    String roles = String.valueOf(claims.get("roles"));

                    log.info("Token validated for user: {}, roles: {}", username, roles);

                    Authentication auth = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            AuthorityUtils.commaSeparatedStringToAuthorityList(roles)
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    log.error("Environment is null, cannot validate token on path {}", path);
                }

            } catch (ExpiredJwtException e) {
                log.warn("JWT expired on path {}: {}", path, e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token Expire");
                return;
            } catch (Exception e) {
                log.error("JWT validation failed on path {}: {}", path, e.getMessage());
                throw new BadCredentialsException("Invalid Token: " + e.getMessage());
            }
        } else {
            log.debug("No Authorization header found for path {}", path);
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
            throws ServletException {
        String path = request.getRequestURI();
        boolean skip = publicPaths.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
        log.debug("shouldNotFilter? {} for path: {}", skip, path);
        return skip;
    }
}


//package com.ola.olastore.filter;
//
//import com.ola.olastore.constant.ApplicationConstant;
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.ExpiredJwtException;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.security.Keys;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.core.env.Environment;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.authority.AuthorityUtils;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.util.AntPathMatcher;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import javax.crypto.SecretKey;
//import java.io.IOException;
//import java.nio.charset.StandardCharsets;
//import java.util.List;
//
//@RequiredArgsConstructor
//public class JWTTokenValidatorFilter extends OncePerRequestFilter {
//
//
//    private final AntPathMatcher pathMatcher = new AntPathMatcher();
//    private final List<String> publicPaths;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request,
//                                    HttpServletResponse response, FilterChain filterChain)
//        throws ServletException, IOException {
//        String authHeader = request.getHeader(ApplicationConstant.JWT_HEADER);
//        if ( authHeader != null) {
//            try {
//                authHeader = authHeader.trim();
//                if (!authHeader.startsWith("Bearer")) {
//                    throw new BadCredentialsException("Missing Bearer' prefix");
//                }
//
//                String[] parts = authHeader.split("\\s+");
//                String jwt = parts[parts.length -1];
//
//
//                Environment env = getEnvironment();
//                if (env != null) {
//                    String secret = env.getProperty(
//                            ApplicationConstant.JWT_SECRET_KEY,
//                            ApplicationConstant.JWT_SECRET_DEFAULT_VALUE
//                    );
//                    SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
//                    Claims claims = Jwts.parser()
//                            .verifyWith(secretKey)
//                            .build()
//                            .parseSignedClaims(jwt)
//                            .getPayload();
//
//                    String username = String.valueOf(claims.get("email"));
//                    String roles = String.valueOf(claims.get("roles"));
//                    Authentication auth = new UsernamePasswordAuthenticationToken(
//                            username,
//                            null,
//                            AuthorityUtils.commaSeparatedStringToAuthorityList(roles)
//                    );
//                    SecurityContextHolder.getContext().setAuthentication(auth);
//                }
//
//            }catch (ExpiredJwtException e) {
//                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                response.getWriter().write("Token Expire");
//                return;
//            } catch (Exception e) {
//                throw new  BadCredentialsException("Invalid Token: " + e.getMessage());
//            }
//        }
//        filterChain.doFilter(request, response);
//    }
//
//
//
//
//
//        @Override
//        protected boolean shouldNotFilter(HttpServletRequest request)
//            throws ServletException {
//            String path = request.getRequestURI();
//            return  publicPaths.stream().anyMatch(publicPaths ->
//                    pathMatcher.match(publicPaths, path));
//            }
//        }
//
//
