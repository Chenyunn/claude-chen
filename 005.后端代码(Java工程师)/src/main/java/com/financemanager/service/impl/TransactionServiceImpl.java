package com.financemanager.service.impl;

import com.financemanager.common.PageResult;
import com.financemanager.dto.request.CreateTransactionRequest;
import com.financemanager.dto.request.TransactionQueryRequest;
import com.financemanager.dto.request.UpdateTransactionRequest;
import com.financemanager.entity.Transaction;
import com.financemanager.exception.BusinessException;
import com.financemanager.exception.ErrorCode;
import com.financemanager.mapper.TransactionMapper;
import com.financemanager.service.interfaces.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 交易服务实现类
 */
@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionMapper transactionMapper;

    public TransactionServiceImpl(TransactionMapper transactionMapper) {
        this.transactionMapper = transactionMapper;
    }

    @Override
    public Transaction getById(Long userId, Long id) {
        Transaction transaction = transactionMapper.findByUserAndId(userId, id);
        if (transaction == null) {
            throw new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND);
        }
        return transaction;
    }

    @Override
    public PageResult<Transaction> queryTransactions(Long userId, TransactionQueryRequest request) {
        long total = transactionMapper.countByUser(userId, request.getType(), request.getCategoryId(),
                request.getStartDate(), request.getEndDate());
        List<Transaction> list = transactionMapper.findByUserPage(userId, request.getType(), request.getCategoryId(),
                request.getStartDate(), request.getEndDate(), request.getOffset(), request.getPageSize());
        return PageResult.of(list, total, request.getPage(), request.getPageSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Transaction create(Long userId, CreateTransactionRequest request) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategoryId(request.getCategoryId());
        transaction.setSubcategoryId(request.getSubcategoryId());
        transaction.setPaymentAccountId(request.getPaymentAccountId());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setTransactionTime(request.getTransactionTime() != null
                ? request.getTransactionTime() : LocalTime.now());
        transaction.setOccurredAt(LocalDateTime.of(request.getTransactionDate(),
                transaction.getTransactionTime()));
        transaction.setMerchant(request.getMerchant());
        transaction.setTitle(request.getTitle());
        transaction.setNote(request.getNote());
        transaction.setSource(request.getSource() != null ? request.getSource() : "manual");

        transactionMapper.insert(transaction);
        return transaction;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Transaction update(Long userId, UpdateTransactionRequest request) {
        Transaction transaction = transactionMapper.findByUserAndId(userId, request.getId());
        if (transaction == null) {
            throw new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND);
        }

        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategoryId(request.getCategoryId());
        transaction.setSubcategoryId(request.getSubcategoryId());
        transaction.setPaymentAccountId(request.getPaymentAccountId());
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        if (request.getTransactionTime() != null) {
            transaction.setTransactionTime(request.getTransactionTime());
        }
        if (request.getTransactionDate() != null && request.getTransactionTime() != null) {
            transaction.setOccurredAt(LocalDateTime.of(request.getTransactionDate(), request.getTransactionTime()));
        }
        transaction.setMerchant(request.getMerchant());
        transaction.setTitle(request.getTitle());
        transaction.setNote(request.getNote());

        transactionMapper.update(transaction);
        return transactionMapper.findByUserAndId(userId, request.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long userId, Long id) {
        Transaction transaction = transactionMapper.findByUserAndId(userId, id);
        if (transaction == null) {
            throw new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND);
        }
        transactionMapper.deleteByUserAndId(userId, id);
    }

    @Override
    public TransactionMapper.MonthlySummary getMonthlySummary(Long userId, LocalDate month) {
        return transactionMapper.getMonthlySummary(userId, month);
    }

    @Override
    public List<TransactionMapper.CategorySummary> getMonthlyCategorySummary(Long userId, LocalDate month, String type) {
        return transactionMapper.getMonthlyCategorySummary(userId, month, type);
    }

    @Override
    public List<Transaction> getRecentTransactions(Long userId, int limit) {
        return transactionMapper.findRecentByUser(userId, limit);
    }
}
