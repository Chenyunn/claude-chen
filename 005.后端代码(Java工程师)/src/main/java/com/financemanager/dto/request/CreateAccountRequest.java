package com.financemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 创建支付账户请求DTO
 */
@Data
public class CreateAccountRequest {

    @NotNull(message = "账户类型不能为空")
    private Integer accountTypeId;

    @NotBlank(message = "账户名称不能为空")
    private String name;

    private String maskedIdentifier;

    private Boolean isDefault = false;

    private Integer sortOrder = 0;
}
