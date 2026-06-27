package com.financemanager.service.interfaces;

import com.financemanager.dto.request.LoginRequest;
import com.financemanager.dto.request.RegisterRequest;
import com.financemanager.dto.response.LoginResponse;
import com.financemanager.entity.User;
import com.financemanager.entity.UserSettings;

/**
 * 认证服务接口
 */
public interface AuthService {

    /**
     * 用户注册
     */
    User register(RegisterRequest request);

    /**
     * 用户登录
     */
    LoginResponse login(LoginRequest request, String clientIp, String userAgent);

    /**
     * 用户登出
     */
    void logout(User currentUser);

    /**
     * 获取当前用户信息和设置
     */
    LoginResponse getUserInfo(User currentUser, UserSettings settings);
}
