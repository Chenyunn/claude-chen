package com.financemanager.exception;

import lombok.Getter;

/**
 * 错误码枚举定义
 */
@Getter
public enum ErrorCode {

    // 通用错误 1xx
    SUCCESS(0, "成功"),
    PARAM_ERROR(1001, "参数错误"),
    SYSTEM_ERROR(1002, "系统错误"),
    DATA_NOT_FOUND(1003, "数据不存在"),

    // 认证相关 2xx
    UNAUTHORIZED(2001, "未授权，请先登录"),
    TOKEN_INVALID(2002, "Token无效或已过期"),
    USERNAME_OR_PASSWORD_ERROR(2003, "用户名或密码错误"),
    USERNAME_ALREADY_EXISTS(2004, "用户名已存在"),
    USER_DISABLED(2005, "账号已被禁用"),
    USER_LOCKED(2006, "账号已被锁定"),

    // 用户相关 3xx
    USER_NOT_FOUND(3001, "用户不存在"),

    // 分类相关 4xx
    CATEGORY_NOT_FOUND(4001, "分类不存在"),

    // 交易相关 5xx
    TRANSACTION_NOT_FOUND(5001, "交易记录不存在"),

    // 账户相关 6xx
    ACCOUNT_NOT_FOUND(6001, "支付账户不存在"),
    ;

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
