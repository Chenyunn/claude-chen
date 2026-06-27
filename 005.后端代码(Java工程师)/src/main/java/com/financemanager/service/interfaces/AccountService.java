package com.financemanager.service.interfaces;

import com.financemanager.dto.request.CreateAccountRequest;
import com.financemanager.entity.PaymentAccount;
import com.financemanager.entity.PaymentAccountType;

import java.util.List;

/**
 * 支付账户服务接口
 */
public interface AccountService {

    /**
     * 获取所有账户类型
     */
    List<PaymentAccountType> getAllAccountTypes();

    /**
     * 获取用户所有支付账户
     */
    List<PaymentAccount> getUserAccounts(Long userId);

    /**
     * 创建支付账户
     */
    PaymentAccount createAccount(Long userId, CreateAccountRequest request);

    /**
     * 更新支付账户
     */
    PaymentAccount updateAccount(Long userId, Long accountId, CreateAccountRequest request);

    /**
     * 删除支付账户
     */
    void deleteAccount(Long userId, Long accountId);

    /**
     * 设置默认账户
     */
    void setDefault(Long userId, Long accountId);

    /**
     * 获取用户默认账户
     */
    PaymentAccount getDefault(Long userId);
}
