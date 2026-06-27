package com.financemanager.security;

import com.financemanager.entity.User;

/**
 * 当前用户上下文，使用ThreadLocal存储
 */
public class UserContext {

    private static final ThreadLocal<User> USER_HOLDER = new ThreadLocal<>();

    public static void setCurrentUser(User user) {
        USER_HOLDER.set(user);
    }

    public static User getCurrentUser() {
        return USER_HOLDER.get();
    }

    public static Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    public static void clear() {
        USER_HOLDER.remove();
    }
}
