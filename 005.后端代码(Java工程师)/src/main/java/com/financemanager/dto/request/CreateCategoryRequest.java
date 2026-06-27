package com.financemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 创建分类请求DTO
 */
@Data
public class CreateCategoryRequest {

    @NotBlank(message = "分类编码不能为空")
    private String code;

    @NotBlank(message = "分类名称不能为空")
    private String name;

    private String icon;

    private String color;

    @NotNull(message = "分类类型不能为空")
    private String type;

    private Integer sortOrder = 0;
}
