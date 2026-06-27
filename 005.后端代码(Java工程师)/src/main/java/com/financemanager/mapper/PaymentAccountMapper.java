package com.financemanager.mapper;

import com.financemanager.entity.PaymentAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户支付账户表 Mapper 接口
 */
@Mapper
public interface PaymentAccountMapper {

    /**
     * 查询用户所有启用的支付账户
     */
    List<PaymentAccount> findAllByUser(@Param("userId") Long userId);

    /**
     * 根据ID查询
     */
    PaymentAccount findById(@Param("id") Long id);

    /**
     * 查找用户默认账户
     */
    PaymentAccount findDefaultByUser(@Param("userId") Long userId);

    /**
     * 取消用户所有默认账户
     */
    int clearDefaultByUser(@Param("userId") Long userId);

    /**
     * 插入新账户
     */
    int insert(PaymentAccount account);

    /**
     * 更新账户
     */
    int update(PaymentAccount account);

    /**
     * 设置默认账户
     */
    int setDefault(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 软删除账户
     */
    int deleteById(@Param("id") Long id, @Param("userId") Long userId);
}
