# AGENTS.md

面向在本仓库开发的开发者和编码代理；插件的使用说明见 [README.md](README.md)，配置字段与行为的完整说明见 [docs/PACKAGE.md](docs/PACKAGE.md)（英文）/ [docs/PACKAGE.zh.md](docs/PACKAGE.zh.md)（中文）。

## 仓库结构

- 本仓库**即一个 dsh bundle 包**（`@lliangworld/dsh-web-search-keenable`）：根 `package.json` 就是插件 manifest，无构建步骤，纯 ESM。2026-10 从 monorepo [dsh-customize-search](https://github.com/lliangworld/dsh-customize-search) 拆出，该插件子目录的提交历史经 `git subtree split` 完整保留在本仓库。
- `index.js`：插件入口——Config schema、密钥解析、provider 注册，以及 search/fetch 两个 provider 的完整实现（单文件）。
- `client.js`：浏览器端设置卡（插件管理页配置入口），手写 `window.__ModuleLoader__.load` factory，无构建步骤。
- `cordis.patch.yml`：loader patch，向 `web` seam insert 本插件（row id `web-search-keenable`）。
- `docs/PACKAGE.md` / `docs/PACKAGE.zh.md`：面向用户的配置文档，改动插件行为后要同步更新；根 `README.md` 是使用说明（安装/升级/provider 固定）。

## 版本兼容性约定

`peerDependencies` 对 `@deepseek-ai/dsh-web` 和 `@deepseek-ai/dsh-launch-environment` 使用 `>=0.2.1-rc.2` 下限范围（1.0.6 起从 `>=0.2.0-rc.1` 收紧）而非官方包的精确钉版本——保留 dsh 升级（如 0.2.1-rc.2 → 0.2.2-rc.1）不会因 peer 不满足而被静默跳过的好处，同时下限如实反映真实需求：1.0.4 的 volatile 热更新与 1.0.5 的 client 半（`plugins.row.config` 槽、`configForms`、settings primitives）都只在 0.2.1-rc.x 存在，官方参照插件 `@deepseek-ai/dsh-web-search-deepseek`（同样的 volatile + `ctx.web` + credentials 组合）钉的也正是 `0.2.1-rc.2`。若追求与官方完全一致的安全姿态，可改回精确钉法，但每次 dsh 升级都需要发版。

例外中的例外：`@deepseek-ai/dsh-credentials` 精确钉 `0.2.1-rc.2`——插件静态导入该包，宽松范围会让不含此包的 dsh 版本在导入时硬失败，而不是干净地跳过插件。官方包同版本发布，因此这个精确钉实际上已把插件门禁在 dsh 0.2.1-rc.2+，另外两个 peer 的宽松下限此前并无实际意义。dsh 升级时需要同步 bump 这个 peer 并发版。

`@deepseek-ai/cordis`（`~4.0.5`）与 `@deepseek-ai/schemastery`（`~3.18.5`）跟随官方包同线。

## 启动顺序：注入 credentials 平面（1.0.8 起）

`index.js` 的 `inject` 是 `["web", "credentials"]`：凭据服务（`dsh-credentials-local`，其 `Service.init` 先 await 完存储文件加载才激活）就绪前，Cordis 让本插件 fiber 保持 PENDING，`apply()` 因此永远不会面对还没挂载的凭据平面——这是 1.0.8 的主修法。根因：只 inject `web` 时一次性密钥播种可能落在平面就绪之前，且 boot 后没有事件再刷新，快照永久为空；tinyfish 的 `available()` 直接门禁该快照，keenable 在 `appTitle` 显式置空时同样中招。`createApiKeyAccess` 的首次播种另带 50×100ms 有限重试作为二级保险（覆盖 resolve 意外 reject 的残余情况），拿到非空值即退出。

接受的代价：不含凭据服务的组合（如 `sdk-minimal` 模板、精简自定义组合）中本插件将保持未加载，而不是退化到启动环境变量——插件本就静态导入 `@deepseek-ai/dsh-credentials` 并精确钉 peer，此类组合已在支持边界外；官方参照插件 `@deepseek-ai/dsh-web-search-deepseek` 刻意不注入（容忍无 seam），本次是刻意偏离。

## 配置热更新约定（1.0.4 起）

全部 Config 字段标 `.volatile()`，provider 构造函数收 thunk、按操作经 `config.x.get()` 读取配置（对齐官方 `@deepseek-ai/dsh-web-search-deepseek`）：loader 对仅 volatile 字段的配置变更走热更新路径（提交进运行中的引用 + `loader/volatile-update` 事件），不重启插件 fiber，因此改配置无需重启 Harness。`createApiKeyAccess` 的密钥快照在首次播种（inject 保证平面就绪 + 有限重试兜底，见上节）之后，持续监听 `credentials/reference-updated` 与 `loader/volatile-update` 刷新，保证 `available()` 与最新配置一致。新增配置字段一律标 `.volatile()`；非 volatile 字段的变更仍会走普通重启路径。

## 浏览器端（client 半，1.0.5 起）

`client.js` 在插件管理页对应 bundle 的行上提供配置入口：

- 行键为 `<包名>#<row id>`（本插件为 `@lliangworld/dsh-web-search-keenable#web-search-keenable`），经 `ctx.slots.register` 注册进 `plugins.row.config` 键控槽；`ctx.configForms.whileServed([ns])` 门控——插件未加载（行禁用）时入口自动消失，ns 即 patch row id。
- 表单用 `@deepseek-ai/dsh-client-ui-primitives` 的 `SettingsForm`/`SettingsValueField`/`SettingsSecretField`/`Switch` 与 `SettingsFormModel`；`react/jsx-runtime`、primitives、`@deepseek-ai/dsh-client-store` 是浏览器基线模块，factory 内直接 require，无需声明。`package.json` 的 `dsh.client.inject` 声明 locale、ui-settings、ui-plugin-manager、api-remotes 四个包，`exports["./client"]` 指向 `client.js`，且 `client.js` 必须在 `files` 中随包分发。
- 密钥不进入配置文件：经 `ctx.remote.credentials` 对 `apiKeyEnv` 命名的引用（`KEENABLE_API_KEY`）describe/set（官方设置页同款）；卡片监听 `credentials/reference-updated` 防竞态刷新。
- 字段分两组：常用字段直接展示，不常用字段（`appTitle`、`site`、`snippetMaxLength`、`maxChars`）收在默认折叠的"高级设置"组内。折叠状态放 controller 的 store（`advancedOpen` + inject 面的 `toggleAdvanced`），**不要用 React hook**（factory 只保证 `react/jsx-runtime` 在基线表里）；`hooks: { keenableCard }` 注入后 prop 名是 `props.useKeenableCard`（写错会在渲染期静默崩溃，控制台报 `props.useXxx is not a function`）。
- 默认值取自 scope 快照的 `base`（继承层，含 schema 默认值）；schema 无默认值的字段（端点基址、应用名）用卡片里的 `FALLBACK_DEFAULTS` 静态表（与 host 侧兜底常量保持一致），统一拼在字段提示文字末尾（`t("defaultValue", {value})`）。primitives 的 `SettingsValueField` **不转发** `placeholder`，勿指望输入框内灰色占位。
- 布尔型配置（`live` 开关）**不要**用文本字段的 `text`/`overridden` 推导界面状态：布尔值经 parse 以布尔类型存入文本字段后，保存即无法回显（`text` 取不到值），界面会显示错误位置。开关位置由 controller 从 scope 快照的生效值计算 + 暂存草稿跟踪（`livePosition`/`setLive`），并沿用官方 `select()` 的语义——拨到与默认值相同的位置走 `resetField` 清除覆盖，只有异于默认值的值才落盘到 patch 文件。
- client 半的改动同样走"改文件 → commit/push → `dsh plugin update`"流程；`dsh-client-modules` 按 Loader row 扫描 `dsh.client` 声明，行启用时才接入浏览器端。

## 修改与发布流程

1. 编辑本仓库根下的文件；
2. `git commit` 并 `git push` 到本仓库 main；
3. 更新本地安装的插件——**直接重跑 `add` 安装命令无效**：pnpm 发现 profile 的 lockfile 中该 spec 未变化时会跳过重新解析，会话内插件管理器随后报 `ambiguous-install`。用 `update` 让分支 spec 重新解析到 main 最新提交（manifest 中的 spec 保持不变，以后仍可用同样方式继续更新）：

```powershell
dsh plugin --profile web update @lliangworld/dsh-web-search-keenable
```

不带包名的 `dsh plugin --profile web update` 会重解析全部依赖。更新后的代码在**下次启动 Harness 时生效**。

示例以 web profile 为例；把 `--profile` 换成 `desktop` 即对桌面客户端的 profile 执行同样的操作。web 与 desktop 是两个独立 profile（各有各的 manifest 和 lockfile），插件要分别安装、分别更新。

## 版本管理

本仓库版本与姊妹仓库 [dsh-web-search-tinyfish](https://github.com/lliangworld/dsh-web-search-tinyfish) **完全独立**：`package.json` 的 `version` 只在本仓库演进，发版只打本仓库的 tag，互不影响。拆分时两仓库均从 `1.0.7` 起（承接拆分前 monorepo 的末版）。

发版即 bump `package.json` 版本 → commit/push → 打 `v*` tag 推送：

```powershell
git tag -a v1.0.8 -m "v1.0.8"
git push origin v1.0.8
```

## 固定版本 / 回退（commit 与 tag spec）

需要把 profile 固定到某个提交或版本时，用带 commit / tag 的 spec 安装（pnpm 的多个参数用 `&` 连接，不要写两个 `#`；`&` 是 shell 保留字符，**整个 spec 要用引号包起来**，PowerShell 裸写会直接报语法错误）：

```powershell
# 固定到某个提交
dsh plugin --profile web add "github:lliangworld/dsh-web-search-keenable#b29e678b28fd4081913a514c451a894f732705db"
```

这种形式会把 profile manifest 里的 spec 改成指定提交并强制 pnpm 解析过去；此后 spec 固定，`update` 不会跟随 main 前进；解除固定则重新 `add` 分支 spec。

tag 发版后可用两种形式（同样注意引号）：

```powershell
# 固定 tag：update 永远停在该 tag 指向的版本；升级需打新 tag 后重新 add
dsh plugin --profile web add "github:lliangworld/dsh-web-search-keenable#v1.0.7"

# semver 范围：以后打了新 tag（如 v1.0.8），update 会自动升到匹配范围的最新 tag，不跟随 main 上未发版的提交
dsh plugin --profile web add "github:lliangworld/dsh-web-search-keenable#semver:^1.0.7"
```

想"跟随发版"推荐 semver 形式：每次发版只需打 tag 推送，本地跑 `update` 即可升级。本仓库是单包仓库，`#semver:` 按本仓库的 `v*` tag 线生效，即按本插件独立发版，不再需要子目录前缀 tag。
