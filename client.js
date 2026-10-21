window.__ModuleLoader__.load({
	id: "@lliangworld/dsh-web-search-keenable",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region lib/types/client/locales.js
		/** Locale bundles for the Keenable settings card. */
		/** English copy. */
		const en = {
			title: "Keenable",
			description: "Keenable-backed search and fetch: ranked results with portable snippets and publication dates, and pages as markdown.",
			apiKey: "API key",
			apiKeyHint: "Stored outside the settings file, under the KEENABLE_API_KEY credential reference. Leave blank to keep the current key.",
			apiKeySet: "A key is configured; the keyed endpoints are used.",
			apiKeyUnset: "No key is configured; the keyless public endpoints are used, which need an application title.",
			baseURL: "Endpoint base",
			baseURLHint: "Keenable API base; /v1/search or /v1/fetch (keyed) and their /public twins (keyless) are appended. Leave blank to restore the default.",
			mode: "Retrieval mode",
			modeHint: "Keenable's mode: pro (deeper retrieval) or realtime (fastest). Leave blank to restore the default.",
			maxResults: "Default result count",
			maxResultsHint: "Result count when a request carries none: an integer from 1 to 50. Leave blank to restore the default.",
			appTitle: "Application title",
			appTitleHint: "Application name sent as the X-Keenable-Title header on keyless calls; defaults to $KEENABLE_APP_TITLE, then deepseek-harness.",
			site: "Site filter",
			siteHint: "Restrict results to one site, such as techcrunch.com. Leave blank for no filter.",
			snippetMaxLength: "Snippet length",
			snippetMaxLengthHint: "Maximum snippet length in characters: an integer from 180 to 10000. Leave blank to restore the default.",
			maxChars: "Fetch character cap",
			maxCharsHint: "Maximum characters of fetched content, sent as Keenable's max_chars. Leave blank to restore the default.",
			live: "Live fetch",
			liveHint: "Fetch the live source instead of Keenable's indexed copy; the indexed copy fails for URLs Keenable has not indexed.",
			advancedShow: "Advanced settings",
			advancedHide: "Hide advanced settings",
			defaultValue: "Default: {value}.",
			noDefault: "No default.",
			overridden: "Overridden",
			reset: "Reset to default",
			invalidText: "Enter one of: pro, realtime. Leave blank to restore the default.",
			invalidBoolean: "Enter true or false, or leave blank to use the default.",
			invalidCount: "Enter an integer from 1 to 50, or leave blank to use the default.",
			invalidSnippet: "Enter an integer from 180 to 10000, or leave blank to use the default.",
			invalidChars: "Enter a positive integer, or leave blank to use the default.",
			unavailable: "This plugin is not loaded, so it cannot be configured right now.",
			readOnly: "This deployment stores settings read-only.",
			save: "Save",
			saving: "Saving…",
			saveFailed: "The deployment did not accept these values; they were left for you to correct."
		};
		/** Simplified Chinese copy. */
		const zh = {
			title: "Keenable",
			description: "基于 Keenable 的搜索与抓取：带可移植摘要与发布时间的排序结果，以及 markdown 页面内容。",
			apiKey: "API Key",
			apiKeyHint: "密钥不写入设置文件，保存在 KEENABLE_API_KEY 凭据引用下。留空表示保持当前密钥。",
			apiKeySet: "已配置密钥；将使用带鉴权端点。",
			apiKeyUnset: "未配置密钥；将使用免密钥公共端点，此时需要应用名。",
			baseURL: "端点基址",
			baseURLHint: "Keenable API 基址；会追加 /v1/search 或 /v1/fetch（带密钥）及其 /public 孪生端点（无密钥）。留空恢复默认。",
			mode: "检索模式",
			modeHint: "Keenable 的 mode：pro（更深检索）或 realtime（最快）。留空恢复默认。",
			maxResults: "默认结果数",
			maxResultsHint: "请求未带结果数时的默认值：1–50 的整数。留空恢复默认。",
			appTitle: "应用名",
			appTitleHint: "免密钥调用时 X-Keenable-Title 头的应用名；默认取 $KEENABLE_APP_TITLE，其次 deepseek-harness。",
			site: "站点过滤",
			siteHint: "将搜索结果限制在单个站点，如 techcrunch.com。留空表示不过滤。",
			snippetMaxLength: "摘要长度",
			snippetMaxLengthHint: "摘要最大字符数：180–10000 的整数。留空恢复默认。",
			maxChars: "抓取字符上限",
			maxCharsHint: "抓取内容的最大字符数，作为 Keenable 的 max_chars 发送。留空恢复默认。",
			live: "实时抓取",
			liveHint: "从源站实时抓取，而非 Keenable 的索引副本；索引副本对未收录的 URL 会失败。",
			advancedShow: "高级设置",
			advancedHide: "收起高级设置",
			defaultValue: "默认值：{value}。",
			noDefault: "无默认值。",
			overridden: "已覆盖",
			reset: "恢复默认",
			invalidText: "请填 pro 或 realtime。留空恢复默认。",
			invalidBoolean: "请填 true 或 false，或留空使用默认值。",
			invalidCount: "请填 1–50 的整数，或留空使用默认值。",
			invalidSnippet: "请填 180–10000 的整数，或留空使用默认值。",
			invalidChars: "请填正整数，或留空使用默认值。",
			unavailable: "该插件当前未加载，暂时无法配置。",
			readOnly: "本部署的设置为只读。",
			save: "保存",
			saving: "保存中…",
			saveFailed: "本部署未接受这些值；请修正后重试。"
		};
		/**
		 * The form frame's copy, read from this card's dictionary.
		 * @param t - the card's locale reader.
		 * @returns the labels the shared settings form renders.
		 */
		function formLabels(t) {
			return {
				unavailable: t("unavailable"),
				readOnly: t("readOnly"),
				saveFailed: t("saveFailed"),
				save: t("save"),
				saving: t("saving")
			};
		}
		//#endregion
		//#region lib/types/client/fields.js
		/**
		 * Parse one of a fixed set of strings: blank clears the override, an
		 * unlisted value is invalid so the form blocks the save.
		 * @param values - the accepted strings.
		 * @returns the field's parse function.
		 */
		function oneOf(values) {
			return (text) => {
				const value = text.trim();
				if (value === "") return { kind: "clear" };
				return values.includes(value) ? { kind: "set", value } : void 0;
			};
		}
		/**
		 * Parse a boolean written as text: blank clears the override, anything
		 * but `true`/`false` is invalid.
		 * @param text - the field's raw text.
		 * @returns the parsed edit, or undefined when the text is not a boolean.
		 */
		function booleanText(text) {
			const value = text.trim();
			if (value === "") return { kind: "clear" };
			if (value === "true") return { kind: "set", value: true };
			if (value === "false") return { kind: "set", value: false };
			return void 0;
		}
		/**
		 * Parse a bounded whole number: blank clears the override, a
		 * non-integer or out-of-range value is invalid.
		 * @param min - the inclusive lower bound.
		 * @param max - the inclusive upper bound.
		 * @returns the field's parse function.
		 */
		function boundedInt(min, max) {
			return (text) => {
				if (text.trim() === "") return { kind: "clear" };
				const value = Number(text);
				return Number.isInteger(value) && value >= min && value <= max ? { kind: "set", value } : void 0;
			};
		}
		/** The form fields the card edits, with the parse each one needs. */
		function keenableFields() {
			return [
				(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("baseURL"),
				{
					...(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("mode"),
					parse: oneOf(["pro", "realtime"])
				},
				(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("appTitle"),
				(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("site"),
				{
					...(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("maxResults"),
					parse: boundedInt(1, 50)
				},
				{
					...(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("snippetMaxLength"),
					parse: boundedInt(180, 1e4)
				},
				{
					...(0, _deepseek_ai_dsh_client_ui_primitives.settingsNumberField)("maxChars"),
					parse: boundedInt(1, Number.MAX_SAFE_INTEGER)
				},
				{
					...(0, _deepseek_ai_dsh_client_ui_primitives.settingsTextField)("live"),
					parse: booleanText
				}
			];
		}
		/**
		 * The value fields the card renders, in order: the config field, the
		 * dictionary key of its invalid-value message, whether it is numeric,
		 * and whether the advanced group holds it.
		 */
		const VALUE_FIELDS = [
			{ name: "baseURL", invalid: "invalidText" },
			{ name: "mode", invalid: "invalidText" },
			{ name: "maxResults", invalid: "invalidCount", numeric: true },
			{ name: "appTitle", invalid: "invalidText", advanced: true },
			{ name: "site", invalid: "invalidText", advanced: true },
			{ name: "snippetMaxLength", invalid: "invalidSnippet", numeric: true, advanced: true },
			{ name: "maxChars", invalid: "invalidChars", numeric: true, advanced: true }
		];
		/**
		 * Host-side fallbacks for fields whose schema carries no default: the
		 * value the provider uses when the config names none. They live beside
		 * the card because the settings schema alone cannot show them; keep
		 * them in step with the provider's own constants.
		 */
		const FALLBACK_DEFAULTS = {
			baseURL: "https://api.keenable.ai",
			appTitle: "deepseek-harness",
			mode: "pro"
		};
		//#endregion
		//#region lib/types/client/styles.js
		/** Card-local styles: the live-fetch toggle row, its hint, and the advanced chevron. */
		const css = ".dshKeenableToggleRow{color:var(--dsw-alias-label-primary);justify-content:space-between;align-items:center;gap:16px;font-size:13px;line-height:1.5;display:flex}.dshKeenableHint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.dshKeenableChevron{transition:transform .15s}.dshKeenableChevronOpen{transform:rotate(180deg)}";
		const tagId = "@lliangworld/dsh-web-search-keenable/KeenableCard.css";
		//#endregion
		//#region lib/types/client/KeenableCard.js
		/**
		 * The default a field falls back to: the value the inherited layer
		 * holds, or the provider's own fallback for a field whose schema
		 * carries no default. The card shows it as the field's text while no
		 * override is staged, and names it in the hint.
		 * @param state - the card's current snapshot.
		 * @param name - the config field.
		 * @returns the default, or undefined when the field has none.
		 */
		function placeholderOf(state, name) {
			const value = state.defaults?.[name];
			return value === void 0 || value === null ? void 0 : String(value);
		}
		/**
		 * Render one value field row.
		 * @param props - the card's props, whose actions write the field.
		 * @param t - the card's locale reader.
		 * @param state - the card's current snapshot.
		 * @param field - the field descriptor from {@link VALUE_FIELDS}.
		 * @param disabled - whether the form refuses edits right now.
		 * @returns the field row.
		 */
		function valueField(props, t, state, field, disabled) {
			const defaultValue = placeholderOf(state, field.name) ?? FALLBACK_DEFAULTS[field.name];
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsValueField, {
				id: `plugin-config-keenable-${field.name}`,
				label: t(field.name),
				hint: `${t(`${field.name}Hint`)} ${defaultValue === void 0 ? t("noDefault") : t("defaultValue", { value: defaultValue })}`,
				placeholder: defaultValue,
				overriddenLabel: t("overridden"),
				resetLabel: t("reset"),
				invalidLabel: t(field.invalid),
				...field.numeric === true ? { numeric: true } : {},
				disabled,
				...state[field.name],
				text: state[field.name].overridden ? state[field.name].text : defaultValue ?? "",
				onEdit: (text) => {
					props.edit(field.name, text);
				},
				onReset: () => {
					props.resetField(field.name);
				}
			}, field.name);
		}
		/**
		 * Render the Keenable provider's one-liner or its settings form, as the
		 * Plugins page asks.
		 * @param props - the view asked for, locale copy, the form snapshot, and its actions.
		 * @returns the one-liner, or the form.
		 */
		function KeenableCard(props) {
			const { t } = props;
			const state = props.useKeenableCard((snapshot) => snapshot);
			if (props.view === "summary") return t("description");
			const disabled = !state.writable || state.saving;
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.SettingsForm, {
				labels: formLabels(t),
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsSecretField, {
						id: "plugin-config-keenable-key",
						label: t("apiKey"),
						hint: t("apiKeyHint"),
						disabled: !state.apiKeyWritable,
						text: state.apiKey.text,
						configured: state.apiKeyConfigured,
						stateLabel: state.apiKeyConfigured ? t("apiKeySet") : t("apiKeyUnset"),
						onEdit: (text) => {
							props.edit("apiKey", text);
						}
					}),
					...VALUE_FIELDS.filter((field) => field.advanced !== true).map((field) => valueField(props, t, state, field, disabled)),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "dshKeenableToggleRow",
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("live") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
							checked: state.live,
							label: t("live"),
							disabled,
							onChange: (checked) => {
								props.setLive(checked);
							}
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: "dshKeenableHint",
						children: t("liveHint")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						size: "sm",
						disabled,
						onClick: () => {
							props.toggleAdvanced();
						},
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(state.advancedOpen ? "advancedHide" : "advancedShow") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
							size: 20,
							"aria-hidden": "true",
							className: `dshKeenableChevron${state.advancedOpen ? " dshKeenableChevronOpen" : ""}`
						})]
					}),
					...state.advancedOpen === true ? VALUE_FIELDS.filter((field) => field.advanced === true).map((field) => valueField(props, t, state, field, disabled)) : []
				]
			});
		}
		//#endregion
		//#region lib/types/client/keenable-card-controller.js
		/** Settings namespace this card edits: the plugin's own row. */
		const NS = "web-search-keenable";
		/** Row-configuration key: the bundle package name and the row its patch declares. */
		const ROW_CONFIG_KEY = "@lliangworld/dsh-web-search-keenable#web-search-keenable";
		/** Credential reference the provider resolves when the config names none. */
		const DEFAULT_API_KEY_REF = "KEENABLE_API_KEY";
		/** Form field the credential control stages under. */
		const API_KEY_FIELD = "apiKey";
		/**
		 * The Keenable settings card's staged form over the plugin's settings
		 * namespace. Two controls sit outside the plain text fields: the API
		 * key, whose literal never rides a response — the card learns only
		 * whether one is configured and writes it through the credentials
		 * domain, addressed by the reference the section names — and the
		 * live-fetch switch, a boolean whose position the card tracks beside
		 * the form. Both are staged with the rest of the form, so one save
		 * covers everything the card shows.
		 */
		var KeenableCardController = class {
			scope;
			ctx;
			form;
			store;
			unsubscribe;
			advancedOpen = false;
			base = {};
			liveDraft = void 0;
			credential = {
				ref: "",
				configured: false,
				writable: true
			};
			/**
			 * @param scope - the bound settings scope for the plugin's namespace.
			 * @param ctx - the browser plugin context, whose `remote.credentials`
			 *   namespace answers for the credential the section references.
			 */
			constructor(scope, ctx) {
				this.scope = scope;
				this.ctx = ctx;
				this.form = new _deepseek_ai_dsh_client_ui_primitives.SettingsFormModel(scope, keenableFields(), [{
					field: API_KEY_FIELD,
					write: (text) => this.writeKey(text)
				}]);
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.projection());
				const publish = () => {
					this.store.set(this.projection());
					if (this.ref() !== this.credential.ref) this.readCredential();
				};
				this.base = scope.getSnapshot().base ?? {};
				this.unsubscribe = [this.form.bind(() => this.form.shell()).subscribe(publish), scope.subscribe(() => {
					this.base = scope.getSnapshot().base ?? {};
					this.readCredential();
				})];
				this.readCredential();
			}
			/** The staged form state the card renders. */
			projection() {
				const state = {
					...this.form.shell(),
					advancedOpen: this.advancedOpen,
					defaults: this.base,
					live: this.livePosition(),
					apiKey: this.form.field(API_KEY_FIELD),
					apiKeyConfigured: this.credential.configured,
					apiKeyWritable: this.credential.writable
				};
				for (const field of VALUE_FIELDS) state[field.name] = this.form.field(field.name);
				return state;
			}
			/** The reference the section names, or the provider's default. */
			ref() {
				return refOf(this.scope.getSnapshot());
			}
			/**
			 * Ask the credentials domain about the reference the section currently
			 * names. The answer is stored with the reference it describes, so two
			 * reads settling out of order cannot publish a stale state.
			 */
			async readCredential() {
				const ref = this.ref();
				if (ref !== this.credential.ref) {
					this.credential = {
						ref,
						configured: false,
						writable: true
					};
					this.store.set(this.projection());
				}
				const response = await this.ctx.remote.credentials.describe([ref]);
				if (!response.ok || ref !== this.ref()) return;
				const view = response.value[ref];
				const next = {
					ref,
					configured: view?.configured ?? false,
					writable: view?.writable ?? true
				};
				if (next.configured === this.credential.configured && next.writable === this.credential.writable) return;
				this.credential = next;
				this.store.set(this.projection());
			}
			/**
			 * Re-read after the Host reports a change to the reference this card
			 * watches; a key can be written from somewhere else, and no settings
			 * section changes when it is.
			 * @param ref - the reference the Host reports as changed.
			 */
			refreshCredential(ref) {
				if (ref !== this.credential.ref) return;
				this.readCredential();
			}
			/**
			 * Write the staged key, then re-read whether the Host now holds one.
			 * @param value - the staged credential literal.
			 * @returns whether the Host reports a configured credential afterwards.
			 */
			async writeKey(value) {
				await this.ctx.remote.credentials.set(this.ref(), value);
				await this.readCredential();
				return this.credential.configured;
			}
			/** Open or close the advanced group. */
			toggleAdvanced() {
				this.advancedOpen = !this.advancedOpen;
				this.store.set(this.projection());
			}
			/**
			 * The live-fetch switch position: the staged draft while it differs
			 * from the config, otherwise the value the section serves. It is
			 * read from the scope rather than the form's text field — a boolean
			 * rides the config as a boolean, and a text field cannot echo one
			 * back, so the field's text goes stale the moment a save lands.
			 */
			livePosition() {
				const effective = this.scope.getSnapshot().value?.live ?? true;
				return this.liveDraft !== void 0 && this.liveDraft !== effective ? this.liveDraft : effective;
			}
			/**
			 * Stage one switch position. A position equal to the inherited value
			 * clears the override so the default keeps applying; anything else
			 * stages the edit the form saves with the rest.
			 * @param checked - the switch's new position.
			 */
			setLive(checked) {
				const base = this.scope.getSnapshot().base;
				if ((base?.live ?? true) === checked) this.form.actions().resetField("live");
				else this.form.actions().edit("live", checked ? "true" : "false");
				this.liveDraft = checked;
				this.store.set(this.projection());
			}
			/** Build the face the slot registration injects. */
			inject() {
				return {
					hooks: { keenableCard: this.store },
					edit: (field, text) => {
						this.form.actions().edit(field, text);
					},
					resetField: (field) => {
						this.form.actions().resetField(field);
					},
					save: () => {
						this.save();
					},
					discard: () => {
						this.liveDraft = void 0;
						this.form.actions().discard();
					},
					setLive: (checked) => {
						this.setLive(checked);
					},
					toggleAdvanced: () => {
						this.toggleAdvanced();
					}
				};
			}
			/** Save the staged form; a refused write stops and keeps the draft. */
			async save() {
				const state = this.projection();
				if (!state.available || state.invalid || state.saving) return;
				await this.form.save();
			}
			/** Release configuration subscriptions. */
			dispose() {
				for (const off of this.unsubscribe) off();
				this.form.dispose();
			}
		};
		/**
		 * The credential reference a section names, or the provider's default.
		 * @param snapshot - the section's current scope snapshot.
		 * @returns the reference to address.
		 */
		function refOf(snapshot) {
			const declared = snapshot.value?.apiKeyEnv;
			return declared !== void 0 && declared.length > 0 ? declared : DEFAULT_API_KEY_REF;
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		 * The Keenable settings card, browser half: the API key through the
		 * credentials domain and every volatile config field through the
		 * plugin's settings namespace. The card registers into the Plugins
		 * page's `plugins.row.config` slot while the Host serves the namespace,
		 * so a deployment without the provider shows no trace of it, and a
		 * saved field reaches the next call without a restart.
		 */
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.credentials",
			"configForms"
		];
		/**
		 * Mount the Keenable settings card while the Host serves its namespace.
		 * @param ctx - the browser plugin context.
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "web-search-keenable: dictionaries");
			ctx.effect(() => {
				if (typeof document === "undefined" || document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") !== null) return () => {};
				const tag = document.createElement("style");
				tag.dataset.plugin = "@lliangworld/dsh-web-search-keenable";
				tag.dataset.pluginCss = tagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "web-search-keenable: card styles");
			const card = new KeenableCardController(ctx.configForms.get(NS), ctx);
			ctx.effect(() => () => {
				card.dispose();
			}, "web-search-keenable: form subscription");
			ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
				card.refreshCredential(ref);
			}), "web-search-keenable: credential invalidations");
			ctx.configForms.whileServed([NS], () => ctx.slots.inject("plugins.row.config", () => ctx.slots.register({
				name: "plugins.row.config",
				key: ROW_CONFIG_KEY,
				locale: NS,
				inject: () => card.inject()
			}, KeenableCard)));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
