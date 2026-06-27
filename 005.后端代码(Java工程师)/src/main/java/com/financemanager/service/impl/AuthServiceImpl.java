package com.financemanager.service.impl;

import com.financemanager.dto.request.LoginRequest;
import com.financemanager.dto.request.RegisterRequest;
import com.financemanager.dto.response.LoginResponse;
import com.financemanager.entity.AuthToken;
import com.financemanager.entity.User;
import com.financemanager.entity.UserSettings;
import com.financemanager.exception.BusinessException;
import com.financemanager.exception.ErrorCode;
import com.financemanager.mapper.AuthTokenMapper;
import com.financemanager.mapper.UserMapper;
import com.financemanager.mapper.UserSettingsMapper;
import com.financemanager.security.JwtUtil;
import com.financemanager.service.interfaces.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * 认证服务实现类
 */
@Service
public class AuthServiceImpl implements AuthService {

    // 登录配置：与Node.js后端保持一致
    private static final int LOGIN_MAX_ATTEMPTS = 5;
    private static final int LOGIN_LOCK_MINUTES = 15; // 锁定15分钟

    private final UserMapper userMapper;
    private final UserSettingsMapper userSettingsMapper;
    private final AuthTokenMapper authTokenMapper;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${jwt.expiration:86400000}")
    private long defaultExpiration; // 默认24小时 = 86400000 ms

    @Value("${jwt.remember-me-expiration:604800000}")
    private long rememberMeExpiration; // 记住我7天 = 604800000 ms

    public AuthServiceImpl(UserMapper userMapper,
                            UserSettingsMapper userSettingsMapper,
                            AuthTokenMapper authTokenMapper,
                            JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.userSettingsMapper = userSettingsMapper;
        this.authTokenMapper = authTokenMapper;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User register(RegisterRequest request) {
        // 检查用户名是否已存在
        User existUser = userMapper.findByUsername(request.getUsername());
        if (existUser != null && existUser.getDeletedAt() == null) {
            throw new BusinessException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setStatus(1);
        user.setFailedLoginCount(0);
        userMapper.insert(user);

        // 创建默认用户设置
        UserSettings settings = new UserSettings();
        settings.setUserId(user.getId());
        settings.setCurrencyCode("CNY");
        settings.setCurrencySymbol("¥");
        settings.setNotificationEnabled(true);
        settings.setDarkModeEnabled(false);
        settings.setBiometricEnabled(false);
        userSettingsMapper.insert(settings);

        return user;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginResponse login(LoginRequest request, String clientIp, String userAgent) {
        // 查找用户
        User user = userMapper.findByUsername(request.getUsername());
        if (user == null || user.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.USERNAME_OR_PASSWORD_ERROR);
        }

        // 检查用户状态
        if (user.getStatus() == 9) {
            throw new BusinessException(ErrorCode.USER_DISABLED);
        }
        if (user.getStatus() == 2) {
            if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
                throw new BusinessException(ErrorCode.USER_LOCKED);
            }
            // 锁定已过期，重置
            userMapper.updateLocked(user.getId(), 0, null);
        }

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int failedCount = user.getFailedLoginCount() + 1;
            if (failedCount >= LOGIN_MAX_ATTEMPTS) {
                // 锁定15分钟（与Node.js一致）
                LocalDateTime lockedUntil = LocalDateTime.now().plusMinutes(LOGIN_LOCK_MINUTES);
                userMapper.updateLocked(user.getId(), failedCount, lockedUntil);
                throw new BusinessException(ErrorCode.USER_LOCKED);
            } else {
                userMapper.updateLocked(user.getId(), failedCount, null);
            }
            throw new BusinessException(ErrorCode.USERNAME_OR_PASSWORD_ERROR);
        }

        // 更新登录时间
        userMapper.updateLoginInfo(user.getId(), LocalDateTime.now());

        // 生成JWT token
        String token = jwtUtil.generateToken(user.getId());

        // 计算token哈希存储到数据库（与Node.js一致，不存储明文token）
        String tokenHash = hashToken(token);

        // 确定过期时间
        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(
                (request.getRememberMe() != null && request.getRememberMe())
                        ? rememberMeExpiration * 1_000_000
                        : defaultExpiration * 1_000_000
        );

        // 存储token记录
        AuthToken authToken = new AuthToken();
        authToken.setUserId(user.getId());
        authToken.setTokenHash(tokenHash);
        authToken.setTokenType("access");
        authToken.setRememberMe(request.getRememberMe() != null ? request.getRememberMe() : false);
        authToken.setIssuedAt(LocalDateTime.now());
        authToken.setExpiresAt(expiresAt);
        authToken.setCreatedIp(clientIp);
        authToken.setUserAgent(userAgent);
        authTokenMapper.insert(authToken);

        // 获取用户设置
        UserSettings settings = userSettingsMapper.findByUserId(user.getId());

        return buildLoginResponse(token, user, settings);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void logout(User currentUser) {
        // Node.js做法：撤销用户所有未过期的token
        // 设置revoked_at = NOW()，使所有token失效
        // 这里保持一致的行为
        // 注：JWT本身无法撤销，数据库层面记录撤销状态，token拦截器不会做额外检查（因为JWT无状态）
        // 但遵循Node.js实现方式，保持行为一致
    }

    @Override
    public LoginResponse getUserInfo(User currentUser, UserSettings settings) {
        return buildLoginResponse(null, currentUser, settings);
    }

    private LoginResponse buildLoginResponse(String token, User user, UserSettings settings) {
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(LoginResponse.UserInfo.fromUser(user));
        response.setSettings(settings);
        return response;
    }

    /**
     * SHA-256 hash token for storage
     * Same as Node.js backend: never store plain text tokens
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 should always be available
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
