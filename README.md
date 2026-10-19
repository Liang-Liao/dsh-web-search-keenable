# dsh-web-search-keenable

一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）网页能力插件，以 `ctx.web` 提供方形式注册，结构和官方 `@deepseek-ai/dsh-web-search-exa` 一致，同时提供**搜索**和**抓取**两个能力。

> a dsh web-capability plugin registering a search and a fetch provider into the `ctx.web` seam, mirroring the shipped `@deepseek-ai/dsh-web-search-exa`.

> **版本要求**：需要 dsh ≥ 0.2.1-rc.2——配置热更新（改配置不重启）与插件管理页内的配置面板都依赖该版本的 loader 与客户端组件。

| 能力 | 后端 | 密钥 |
|---|---|---|
| `web_search` + `web_fetch` | Keenable `/v1/search`、`/v1/fetch` | 可无密钥（公共端点限流），有密钥更好：配置 `apiKey`、凭据服务或 `$KEENABLE_API_KEY` |

姊妹插件（TinyFish 后端）在独立仓库 [dsh-web-search-tinyfish](https://github.com/Liang-Liao/dsh-web-search-tinyfish)。两个插件互相独立、版本各自管理，可以只装其中一个，也可以两个都装。

## 安装

命令里的 `--profile <name>` 决定插件装进哪个 profile：`web`（Web GUI）或 `desktop`（桌面客户端）。**两个 profile 互相独立**（各有各的 manifest 和 lockfile），装了 web 不会自动装到 desktop，需要的话两边分别执行。

```powershell
# web profile
dsh plugin --profile web add github:Liang-Liao/dsh-web-search-keenable

# desktop profile
dsh plugin --profile desktop add github:Liang-Liao/dsh-web-search-keenable
```

`github:用户名/仓库名` 也可以写成完整仓库地址 `https://github.com/Liang-Liao/dsh-web-search-keenable`。

## 升级

插件以分支 spec 安装，升级即让 pnpm 重新解析到仓库 main 的最新提交：

```powershell
# 更新插件（web profile）
dsh plugin --profile web update @customize/dsh-web-search-keenable

# desktop profile 同理
dsh plugin --profile desktop update @customize/dsh-web-search-keenable
```

web 与 desktop 需要各自执行升级。更新后的代码在**下次启动 Harness 时生效**。

> **不要用重跑 `add` 的方式升级**：spec 未变化时 pnpm 会跳过重新解析，升级请用 `update`。固定到历史版本、tag 安装等进阶用法见 [AGENTS.md](AGENTS.md)。

## 固定使用哪个提供方

在 profile 的 `cordis.patch.yml` 中指定，搜索和抓取可以分别选择（混搭亦可）：

```yaml
- id: web
  config:
    searchProvider: keenable   # 或 tinyfish
    fetchProvider: keenable    # 或 tinyfish
```

不指定的情况下，`ctx.web` 会自动选用各自能力下已注册且可用的提供方。

## 配置热更新

插件的全部配置字段都是易变的（volatile）：在 profile 配置中修改任意字段——端点、检索模式、数量上限、过滤条件、密钥引用等——**下一次调用即生效**，无需重启 Harness（loader 会把新值提交进运行中的插件，而不是重启它）。API 密钥按操作解析：配置字面量 `apiKey` → 凭据服务（`KEENABLE_API_KEY` 引用）→ 启动环境变量，任一提供均可。各字段完整说明见 [docs/PACKAGE.md](docs/PACKAGE.md)（英文）与 [docs/PACKAGE.zh.md](docs/PACKAGE.zh.md)（中文）。

## 在插件管理页配置（1.0.5 起）

本插件带浏览器端设置卡：插件管理页中对应 bundle 的**行标题即配置入口**，点击进入行的配置页——API 密钥经凭据服务管理（不写入设置文件），除 `apiKeyEnv` 外的全部字段均可编辑（提示文字标注默认值、覆盖状态与恢复默认；不常用字段收在默认折叠的“高级设置”组内），保存后下一次调用即生效。配置入口仅在插件加载后出现。

## 目录结构

```text
.
├── index.js            # 插件入口：配置模式、凭据解析、提供方注册，两个提供方的完整实现（单文件、无需构建）
├── client.js           # 浏览器端设置卡（插件管理页配置入口，手写 __ModuleLoader__ factory，无构建步骤）
├── cordis.patch.yml    # loader patch：向 web seam insert 本插件
├── icon.svg
├── locale/             # en.json / zh.json
├── docs/
│   ├── PACKAGE.md      # 包参考文档（英文）：配置字段与行为完整说明
│   └── PACKAGE.zh.md   # 包参考文档（中文）
├── AGENTS.md           # 开发与发布流程（面向开发者/编码代理）
├── LICENSE             # MIT
├── README.md           # 本文件：使用说明
└── package.json        # 本仓库即一个 dsh bundle 包
```

纯 ESM、无构建步骤。

## License

[MIT](LICENSE)
