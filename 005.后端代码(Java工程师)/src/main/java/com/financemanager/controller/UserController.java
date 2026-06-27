package com.financemanager.controller;

import com.financemanager.common.Result;
import com.financemanager.dto.request.UpdateUserProfileRequest;
import com.financemanager.entity.User;
import com.financemanager.entity.UserSettings;
import com.financemanager.security.CurrentUser;
import com.financemanager.service.interfaces.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * 用户信息控制器
 */
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/profile")
    public Result<User> getProfile(@CurrentUser User currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return Result.success(user);
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/profile")
    public Result<User> updateProfile(@CurrentUser User currentUser,
                                      @Valid @RequestBody UpdateUserProfileRequest request) {
        User user = userService.updateProfile(currentUser.getId(), request);
        return Result.success(user);
    }

    /**
     * 获取用户设置
     */
    @GetMapping("/settings")
    public Result<UserSettings> getSettings(@CurrentUser User currentUser) {
        UserSettings settings = userService.getUserSettings(currentUser.getId());
        return Result.success(settings);
    }

    /**
     * 更新用户设置
     */
    @PutMapping("/settings")
    public Result<UserSettings> updateSettings(@CurrentUser User currentUser,
                                                @RequestBody UserSettings settings) {
        UserSettings updated = userService.updateSettings(currentUser.getId(), settings);
        return Result.success(updated);
    }
}
