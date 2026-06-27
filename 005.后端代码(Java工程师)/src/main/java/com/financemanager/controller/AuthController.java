package com.financemanager.controller;

import com.financemanager.common.Result;
import com.financemanager.dto.request.LoginRequest;
import com.financemanager.dto.request.RegisterRequest;
import com.financemanager.dto.response.LoginResponse;
import com.financemanager.entity.User;
import com.financemanager.entity.UserSettings;
import com.financemanager.security.CurrentUser;
import com.financemanager.service.interfaces.AuthService;
import com.financemanager.service.interfaces.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    /**
     * 用户注册
     * 注册成功后直接返回token，和Node.js后端保持一致
     */
    @PostMapping("/register")
    public Result<LoginResponse> register(@Valid @RequestBody RegisterRequest request,
                                           HttpServletRequest servletRequest) {
        User user = authService.register(request);
        // 注册成功后自动登录，返回token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(request.getUsername());
        loginRequest.setPassword(request.getPassword());
        loginRequest.setRememberMe(false);
        String clientIp = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        LoginResponse response = authService.login(loginRequest, clientIp, userAgent);
        return Result.success("注册成功", response);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                        HttpServletRequest servletRequest) {
        String clientIp = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        LoginResponse response = authService.login(request, clientIp, userAgent);
        return Result.success(response);
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<Void> logout(@CurrentUser User currentUser) {
        authService.logout(currentUser);
        return Result.success();
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public Result<LoginResponse> me(@CurrentUser User currentUser) {
        UserSettings settings = userService.getUserSettings(currentUser.getId());
        LoginResponse response = authService.getUserInfo(currentUser, settings);
        return Result.success(response);
    }

    /**
     * 获取客户端真实IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理的情况，第一个IP为客户端真实IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
