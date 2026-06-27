package com.financemanager.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新用户信息请求DTO
 */
@Data
public class UpdateUserProfileRequest {

    @Size(max = 50, message = "昵称长度不能超过50")
    private String nickname;

    @Size(max = 500, message = "头像地址长度不能超过500")
    private String avatarUrl;

    @Size(max = 200, message = "个性签名长度不能超过200")
    private String signature;
}
