package com.financemanager.mapper;

import com.financemanager.entity.PaymentAccountType;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 支付账户类型字典表 Mapper 接口
 */
@Mapper
public interface PaymentAccountTypeMapper {

    /**
     * 查询所有启用的支付账户类型
     */
    List<PaymentAccountType> findAllEnabled();

    /**
     * 根据ID查询
     */
    PaymentAccountType findById(Integer id);
}
