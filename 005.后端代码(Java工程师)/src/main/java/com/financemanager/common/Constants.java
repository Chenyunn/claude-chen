package com.financemanager.common;

/**
 * 常量定义
 */
public class Constants {

    /**
     * Token 请求头名称
     */
    public static final String TOKEN_HEADER = "Authorization";

    /**
     * Token 前缀
     */
    public static final String TOKEN_PREFIX = "Bearer ";

    /**
     * 交易类型 - 支出
     */
    public static final String TRANSACTION_TYPE_EXPENSE = "expense";

    /**
     * 交易类型 - 收入
     */
    public static final String TRANSACTION_TYPE_INCOME = "income";

    /**
     * 默认分页大小
     */
    public static final int DEFAULT_PAGE_SIZE = 20;

    /**
     * 默认页码
     */
    public static final int DEFAULT_PAGE = 1;

    private Constants() {
    }
}
