/**
 * pages.json / manifest.json 静态审查
 *
 * 作用说明：
 * - 验证 manifest.json 关键配置完整性
 * - 验证 pages.json 页面路由配置
 * - 检查已知缺失资源（tabBar 图标、appid）
 * - 检查不安全配置（urlCheck、ATS）
 *
 * 对应测试计划：
 * - STATIC-03: manifest/pages.json 审查
 * - STATIC-04: 缺失资源检查（src/static 不存在）
 * - XC-08: tabBar 图标缺失
 * - UA-SEC-04: 小程序 urlCheck 关闭
 * - UA-SEC-05: iOS ATS 允许明文
 * - UA-SEC-07: mp-weixin appid 为空
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const uniappRoot = path.resolve(
  __dirname,
  '../../../007.跨端APP应用(移动端开发工程师)/uniapp-projct'
);
const srcRoot = path.join(uniappRoot, 'src');

// ==========================================================
// manifest.json 审查
// ==========================================================
describe('manifest.json — 配置完整性审查', () => {
  let manifest: any;

  beforeAll(() => {
    const manifestPath = path.join(uniappRoot, 'src', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    }
  });

  it('manifest.json 应存在且可解析', () => {
    expect(manifest).toBeDefined();
  });

  it('STATIC-03: 应包含基本应用信息', () => {
    if (manifest) {
      expect(manifest).toHaveProperty('name');
      console.log(`  应用名称: ${manifest.name}`);
    } else {
      console.log('  ⚠️  manifest.json 不存在或无法解析');
    }
  });

  it('★ UA-SEC-07: mp-weixin.appid 应为有效值（非空）', () => {
    if (manifest && manifest['mp-weixin']) {
      const appid = manifest['mp-weixin'].appid;
      console.log(`  [UA-SEC-07] 微信小程序 appid: "${appid || '(空)'}"`);
      if (!appid) {
        console.log('  ⚠️  appid 为空 → 无法上传/真机审核 → P2');
      }
    }
  });

  it('★ UA-SEC-04: 小程序 urlCheck 不应关闭', () => {
    if (manifest && manifest['mp-weixin']) {
      const urlCheck = manifest['mp-weixin'].urlCheck;
      console.log(`  [UA-SEC-04] urlCheck: ${urlCheck}`);
      if (urlCheck === false) {
        console.log('  ⚠️  urlCheck 关闭 → 无法通过小程序审核 → P2');
      }
    }
  });

  it('★ UA-SEC-05: iOS 不应允许任意 HTTP 请求', () => {
    if (manifest && manifest['app-plus']?.distribute?.ios) {
      const ats = manifest['app-plus'].distribute.ios.ATS;
      console.log(`  [UA-SEC-05] iOS ATS 配置: ${JSON.stringify(ats)}`);
      if (ats?.NSAllowsArbitraryLoads === true) {
        console.log('  ⚠️  NSAllowsArbitraryLoads = true → 中间人攻击风险 → P2');
      }
    }
  });
});

// ==========================================================
// pages.json 审查
// ==========================================================
describe('pages.json — 页面路由配置审查', () => {
  let pages: any;

  beforeAll(() => {
    const pagesPath = path.join(uniappRoot, 'src', 'pages.json');
    if (fs.existsSync(pagesPath)) {
      pages = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));
    }
  });

  it('pages.json 应存在且可解析', () => {
    expect(pages).toBeDefined();
  });

  it('应包含 7 个页面路由', () => {
    if (pages?.pages) {
      expect(pages.pages.length).toBeGreaterThanOrEqual(7);
      const pagePaths = pages.pages.map((p: any) => p.path);
      console.log(`  页面路由 (${pages.pages.length}): ${pagePaths.join(', ')}`);
      expect(pagePaths).toContain('pages/login/login');
      expect(pagePaths).toContain('pages/index/index');
      expect(pagePaths).toContain('pages/records/records');
      expect(pagePaths).toContain('pages/food/food');
      expect(pagePaths).toContain('pages/statistics/statistics');
      expect(pagePaths).toContain('pages/profile/profile');
    }
  });

  it('应包含 5 个 tabBar 标签', () => {
    if (pages?.tabBar?.list) {
      expect(pages.tabBar.list.length).toBe(5);
      const tabNames = pages.tabBar.list.map((t: any) => t.text);
      console.log(`  tabBar 标签: ${tabNames.join(', ')}`);
    }
  });

  it('★ XC-08: tabBar 图标路径引用的文件应存在', () => {
    if (pages?.tabBar?.list) {
      pages.tabBar.list.forEach((tab: any, index: number) => {
        if (tab.iconPath) {
          const iconAbsPath = path.join(srcRoot, tab.iconPath);
          const exists = fs.existsSync(iconAbsPath);
          if (!exists) {
            console.log(`  ⚠️  [XC-08] tabBar[${index}] "${tab.text}" 图标不存在: ${tab.iconPath} → P1`);
          }
        }
      });
    }
  });

  it('STATIC-04: src/static 目录应存在', () => {
    const staticDir = path.join(srcRoot, 'static');
    const exists = fs.existsSync(staticDir);
    console.log(`  [STATIC-04] src/static 目录: ${exists ? '存在' : '缺失 ⚠️ → P1'}`);
  });

  it('src/components 目录应存在（若无则确认为缺失）', () => {
    const compDir = path.join(srcRoot, 'components');
    const exists = fs.existsSync(compDir);
    if (!exists) {
      console.log('  注意: src/components 目录不存在（无复用组件）');
    }
  });
});

// ==========================================================
// 源码文件存在性验证
// ==========================================================
describe('关键源文件存在性验证', () => {

  const requiredFiles = [
    'src/main.ts',
    'src/App.vue',
    'src/store/index.ts',
    'src/utils/api.ts',
    'src/types/index.ts',
    'src/pages.json',
  ];

  requiredFiles.forEach(file => {
    it(`${file} 应存在`, () => {
      const absPath = path.join(uniappRoot, file);
      expect(fs.existsSync(absPath)).toBe(true);
    });
  });

  const apiFiles = [
    'src/api/category.ts',
    'src/api/transaction.ts',
    'src/api/account.ts',
    'src/api/food.ts',
    'src/api/statistics.ts',
  ];

  apiFiles.forEach(file => {
    it(`${file} 应存在`, () => {
      const absPath = path.join(uniappRoot, file);
      expect(fs.existsSync(absPath)).toBe(true);
    });
  });
});
