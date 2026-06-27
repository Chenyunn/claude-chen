package com.financemanager.dto.response;

import com.financemanager.entity.User;
import com.financemanager.entity.UserSettings;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录响应DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private UserInfo user;
    private UserSettings settings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String nickname;
        private String avatarUrl;
        private String signature;

        public static UserInfo fromUser(User user) {
            UserInfo info = new UserInfo();
            info.setId(user.getId());
            info.setUsername(user.getUsername());
            info.setNickname(user.getNickname());
            info.setAvatarUrl(user.getAvatarUrl());
            info.setSignature(user.getSignature());
            return info;
        }
    }
}
