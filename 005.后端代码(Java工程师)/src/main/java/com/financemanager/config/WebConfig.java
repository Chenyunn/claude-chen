package com.financemanager.config;

import com.financemanager.security.TokenInterceptor;
import com.financemanager.security.CurrentUserHandlerMethodArgumentResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web配置类
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final TokenInterceptor tokenInterceptor;
    private final CurrentUserHandlerMethodArgumentResolver currentUserResolver;

    public WebConfig(TokenInterceptor tokenInterceptor,
                      CurrentUserHandlerMethodArgumentResolver currentUserResolver) {
        this.tokenInterceptor = tokenInterceptor;
        this.currentUserResolver = currentUserResolver;
    }

    /**
     * 配置跨域
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * 添加拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tokenInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/login",
                        "/auth/register"
                );
    }

    /**
     * 添加参数解析器
     */
    @Override
    public void addArgumentResolvers(List argumentResolvers) {
        argumentResolvers.add(currentUserResolver);
    }
}
