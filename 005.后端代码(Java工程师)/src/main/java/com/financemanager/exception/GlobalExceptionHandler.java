package com.financemanager.exception;

import com.financemanager.common.Result;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常处理
     * HTTP状态码根据业务错误码返回，与Node.js后端相同
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> businessExceptionHandler(BusinessException e) {
        log.warn("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 参数校验异常 - MethodArgumentNotValidException
     * 返回所有验证错误字段，与Node.js后端格式保持一致
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public Result<Void> methodArgumentNotValidExceptionHandler(MethodArgumentNotValidException e) {
        List<Result.ValidationError> errors = e.getBindingResult().getFieldErrors()
                .stream()
                .map(fieldError -> new Result.ValidationError(
                        fieldError.getField(),
                        fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "验证失败"
                ))
                .collect(Collectors.toList());
        String message = "参数验证失败";
        log.warn("参数校验失败，{} 个错误", errors.size());
        Result<Void> result = Result.unprocessableEntity(message);
        result.setErrors(errors);
        return result;
    }

    /**
     * 参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> bindExceptionHandler(BindException e) {
        List<Result.ValidationError> errors = e.getFieldErrors()
                .stream()
                .map(fieldError -> new Result.ValidationError(
                        fieldError.getField(),
                        fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "验证失败"
                ))
                .collect(Collectors.toList());
        String message = "参数绑定失败";
        log.warn("参数绑定失败: {}", message);
        Result<Void> result = Result.badRequest(message);
        result.setErrors(errors);
        return result;
    }

    /**
     * 约束违规异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public Result<Void> constraintViolationExceptionHandler(ConstraintViolationException e) {
        List<Result.ValidationError> errors = e.getConstraintViolations()
                .stream()
                .map(violation -> new Result.ValidationError(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()
                ))
                .collect(Collectors.toList());
        String message = "参数约束违规";
        log.warn("参数约束违规: {}", message);
        Result<Void> result = Result.unprocessableEntity(message);
        result.setErrors(errors);
        return result;
    }

    /**
     * 未知异常处理
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> exceptionHandler(Exception e) {
        log.error("系统未知异常", e);
        return Result.error(500, "系统内部错误");
    }
}
