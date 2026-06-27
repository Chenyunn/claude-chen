package com.financemanager;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 财务管家后端应用启动类
 * 个人财务管理REST API服务
 */
@SpringBootApplication
@MapperScan("com.financemanager.mapper")
public class FinanceManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceManagerApplication.class, args);
        System.out.println("====================================");
        System.out.println("    财务管家 Finance Manager 启动完成    ");
        System.out.println("    访问地址: http://localhost:8081/api");
        System.out.println("====================================");
    }
}
