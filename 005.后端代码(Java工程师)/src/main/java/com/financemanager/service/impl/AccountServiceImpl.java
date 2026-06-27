package com.financemanager.service.impl;

import com.financemanager.dto.request.CreateAccountRequest;
import com.financemanager.entity.PaymentAccount;
import com.financemanager.entity.PaymentAccountType;
import com.financemanager.exception.BusinessException;
import com.financemanager.exception.ErrorCode;
import com.financemanager.mapper.PaymentAccountMapper;
import com.financemanager.mapper.PaymentAccountTypeMapper;
import com.financemanager.service.interfaces.AccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 支付账户服务实现类
 */
@Service
public class AccountServiceImpl implements AccountService {

    private final PaymentAccountTypeMapper accountTypeMapper;
    private final PaymentAccountMapper accountMapper;

    public AccountServiceImpl(PaymentAccountTypeMapper accountTypeMapper,
                              PaymentAccountMapper accountMapper) {
        this.accountTypeMapper = accountTypeMapper;
        this.accountMapper = accountMapper;
    }

    @Override
    public List<PaymentAccountType> getAllAccountTypes() {
        return accountTypeMapper.findAllEnabled();
    }

    @Override
    public List<PaymentAccount> getUserAccounts(Long userId) {
        return accountMapper.findAllByUser(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentAccount createAccount(Long userId, CreateAccountRequest request) {
        PaymentAccount account = new PaymentAccount();
        account.setUserId(userId);
        account.setAccountTypeId(request.getAccountTypeId());
        account.setName(request.getName());
        account.setMaskedIdentifier(request.getMaskedIdentifier());
        account.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        account.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        account.setIsActive(true);

        // 如果是第一个账户或者设置为默认，清除原有默认并设置新默认
        if (Boolean.TRUE.equals(account.getIsDefault())) {
            accountMapper.clearDefaultByUser(userId);
        }

        accountMapper.insert(account);
        return account;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentAccount updateAccount(Long userId, Long accountId, CreateAccountRequest request) {
        PaymentAccount account = accountMapper.findById(accountId);
        if (account == null || account.getDeletedAt() != null || !userId.equals(account.getUserId())) {
            throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        account.setAccountTypeId(request.getAccountTypeId());
        account.setName(request.getName());
        account.setMaskedIdentifier(request.getMaskedIdentifier());
        if (request.getIsDefault() != null) {
            account.setIsDefault(request.getIsDefault());
        }
        if (request.getSortOrder() != null) {
            account.setSortOrder(request.getSortOrder());
        }

        accountMapper.update(account);
        return accountMapper.findById(accountId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAccount(Long userId, Long accountId) {
        PaymentAccount account = accountMapper.findById(accountId);
        if (account == null || account.getDeletedAt() != null || !userId.equals(account.getUserId())) {
            throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        accountMapper.deleteById(accountId, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setDefault(Long userId, Long accountId) {
        // 验证账户存在且属于用户
        PaymentAccount account = accountMapper.findById(accountId);
        if (account == null || account.getDeletedAt() != null || !userId.equals(account.getUserId())) {
            throw new BusinessException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        accountMapper.setDefault(accountId, userId);
    }

    @Override
    public PaymentAccount getDefault(Long userId) {
        return accountMapper.findDefaultByUser(userId);
    }
}
