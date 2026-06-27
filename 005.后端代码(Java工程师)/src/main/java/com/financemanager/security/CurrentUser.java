package com.financemanager.security;

import java.lang.annotation.*;

/**
 * 在Controller方法参数中注入当前登录用户注解
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {
}
