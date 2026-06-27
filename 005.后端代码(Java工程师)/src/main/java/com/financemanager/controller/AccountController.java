package com.financemanager.controller;

import com.financemanager.common.Result;
import com.financemanager.dto.request.CreateAccountRequest;
import com.financemanager.entity.PaymentAccount;
import com.financemanager.entity.PaymentAccountType;
import com.financemanager.entity.User;
import com.financemanager.security.CurrentUser;
import com.financemanager.service.interfaces.AccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 支付账户控制器
 */
@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * 获取所有账户类型（字典数据）
     */
    @GetMapping("/types")
    public Result<List<PaymentAccountType>> getAccountTypes() {
        List<PaymentAccountType> types = accountService.getAllAccountTypes();
        return Result.success(types);
    }

    /**
     * 获取用户所有账户
     */
    @GetMapping
    public Result<List<PaymentAccount>> getUserAccounts(@CurrentUser User currentUser) {
        List<PaymentAccount> accounts = accountService.getUserAccounts(currentUser.getId());
        return Result.success(accounts);
    }

    /**
     * 创建支付账户
     */
    @PostMapping
    public Result<PaymentAccount> create(@CurrentUser User currentUser,
                                          @Valid @RequestBody CreateAccountRequest request) {
        PaymentAccount account = accountService.createAccount(currentUser.getId(), request);
        return Result.success(account);
    }

    /**
     * 更新支付账户
     */
    @PutMapping("/{accountId}")
    public Result<PaymentAccount> update(@CurrentUser User currentUser,
                                          @PathVariable Long accountId,
                                          @Valid @RequestBody CreateAccountRequest request) {
        PaymentAccount account = accountService.updateAccount(currentUser.getId(), accountId, request);
        return Result.success(account);
    }

    /**
     * 删除支付账户
     */
    @DeleteMapping("/{accountId}")
    public Result<Void> delete(@CurrentUser User currentUser, @PathVariable Long accountId) {
        accountService.deleteAccount(currentUser.getId(), accountId);
        return Result.success();
    }

    /**
     * 设置默认账户
     */
    @PostMapping("/{accountId}/set-default")
    public Result<Void> setDefault(@CurrentUser User currentUser, @PathVariable Long accountId) {
        accountService.setDefault(currentUser.getId(), accountId);
        return Result.success();
    }

    /**
     * 获取默认账户
     */
    @GetMapping("/default")
    public Result<PaymentAccount> getDefault(@CurrentUser User currentUser) {
        PaymentAccount account = accountService.getDefault(currentUser.getId());
        return Result.success(account);
    }
}
