package com.financemanager.service.interfaces;

import com.financemanager.dto.request.UpdateUserProfileRequest;
import com.financemanager.entity.User;
import com.financemanager.entity.UserSettings;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 获取用户信息
     */
    User getUserById(Long userId);

    /**
     * 获取用户设置
     */
    UserSettings getUserSettings(Long userId);

    /**
     * 更新用户信息
     */
    User updateProfile(Long userId, UpdateUserProfileRequest request);

    /**
     * 更新用户设置
     */
    UserSettings updateSettings(Long userId, UserSettings settings);
}
