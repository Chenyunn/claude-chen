package com.financemanager.common;

import lombok.Data;

import java.util.List;

/**
 * 统一API响应结果封装
 * 与Node.js后端保持一致的响应格式：
 * - 成功: {code: 0, message: "...", data: T}
 * - 失败: {code: 错误码, message: "...", errors: [...]}
 */
@Data
public class Result<T> {

    private int code;
    private String message;
    private T data;
    private List<ValidationError> errors;

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(0);  // code=0 表示成功（与Node.js后端一致）
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(0);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> error(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> badRequest(String message) {
        Result<T> result = new Result<>();
        result.setCode(400);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> unauthorized(String message) {
        Result<T> result = new Result<>();
        result.setCode(401);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> forbidden(String message) {
        Result<T> result = new Result<>();
        result.setCode(403);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> notFound(String message) {
        Result<T> result = new Result<>();
        result.setCode(404);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> conflict(String message) {
        Result<T> result = new Result<>();
        result.setCode(409);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> locked(String message) {
        Result<T> result = new Result<>();
        result.setCode(423);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> unprocessableEntity(String message) {
        Result<T> result = new Result<>();
        result.setCode(422);
        result.setMessage(message);
        return result;
    }

    /**
     * 验证错误信息
     */
    @Data
    @lombok.AllArgsConstructor
    public static class ValidationError {
        private String field;
        private String message;
    }
}
