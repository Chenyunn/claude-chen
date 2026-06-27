package com.financemanager.service.impl;

import com.financemanager.dto.request.UpdateUserProfileRequest;
import com.financemanager.entity.User;
import com.financemanager.entity.UserSettings;
import com.financemanager.exception.BusinessException;
import com.financemanager.exception.ErrorCode;
import com.financemanager.mapper.UserMapper;
import com.financemanager.mapper.UserSettingsMapper;
import com.financemanager.service.interfaces.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserSettingsMapper userSettingsMapper;

    public UserServiceImpl(UserMapper userMapper, UserSettingsMapper userSettingsMapper) {
        this.userMapper = userMapper;
        this.userSettingsMapper = userSettingsMapper;
    }

    @Override
    public User getUserById(Long userId) {
        return userMapper.findById(userId);
    }

    @Override
    public UserSettings getUserSettings(Long userId) {
        return userSettingsMapper.findByUserId(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User updateProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userMapper.findById(userId);
        if (user == null || user.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getSignature() != null) {
            user.setSignature(request.getSignature());
        }

        userMapper.update(user);
        return userMapper.findById(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserSettings updateSettings(Long userId, UserSettings settings) {
        UserSettings existing = userSettingsMapper.findByUserId(userId);
        if (existing == null) {
            settings.setUserId(userId);
            userSettingsMapper.insert(settings);
        } else {
            userSettingsMapper.update(settings);
        }
        return userSettingsMapper.findByUserId(userId);
    }
}
