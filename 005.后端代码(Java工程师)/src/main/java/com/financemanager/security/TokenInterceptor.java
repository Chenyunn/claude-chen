package com.financemanager.security;

import com.financemanager.common.Constants;
import com.financemanager.entity.AuthToken;
import com.financemanager.entity.User;
import com.financemanager.exception.BusinessException;
import com.financemanager.exception.ErrorCode;
import com.financemanager.mapper.AuthTokenMapper;
import com.financemanager.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Token认证拦截器
 */
@Slf4j
@Component
public class TokenInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final AuthTokenMapper authTokenMapper;

    public TokenInterceptor(JwtUtil jwtUtil, UserMapper userMapper, AuthTokenMapper authTokenMapper) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.authTokenMapper = authTokenMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 放行 CORS 预检请求（OPTIONS 不带 Authorization header，无需校验）
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 获取token
        String token = request.getHeader(Constants.TOKEN_HEADER);
        if (token == null || token.isEmpty()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        // 去除Bearer前缀
        if (token.startsWith(Constants.TOKEN_PREFIX)) {
            token = token.substring(Constants.TOKEN_PREFIX.length());
        }

        // 验证token有效性
        if (jwtUtil.isTokenExpired(token)) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }

        // 获取用户ID
        Long userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }

        // 查询用户
        User user = userMapper.findById(userId);
        if (user == null || user.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 检查用户状态
        if (user.getStatus() != 1) {
            if (user.getStatus() == 9) {
                throw new BusinessException(ErrorCode.USER_DISABLED);
            }
            if (user.getStatus() == 2) {
                throw new BusinessException(ErrorCode.USER_LOCKED);
            }
        }

        // 将用户信息存入ThreadLocal
        UserContext.setCurrentUser(user);

        // 更新最近使用时间
        // 这里可以异步更新，不影响主流程
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 清理ThreadLocal，防止内存泄漏
        UserContext.clear();
    }
}
