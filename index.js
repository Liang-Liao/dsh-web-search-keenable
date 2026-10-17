import { credentialRef, isCredentialRefName } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import z from "@deepseek-ai/schemastery";
import { WebError } from "@deepseek-ai/dsh-web";
/**
 * `KeenableSearchProvider`: a `WebSearchProvider` backed by the Keenable search
 * API (`POST /v1/search`, or the keyless `POST /v1/search/public` when no API
 * key is configured). It maps the first non-blank of `snippet` then
 * `description` to `snippet`, maps `published_at` to `publishedAt`, drops
 * entries without a portable snippet, and omits `content` because Keenable
 * returns no generated answer.
 * @module @customize/dsh-web-search-keenable/provider
 */
/** Stable id this provider registers under. */
const KEENABLE_PROVIDER_ID = "keenable";
/** Default Keenable endpoint base; `/v1/search` is the keyed operation. */
const KEENABLE_DEFAULT_BASE_URL = "https://api.keenable.ai";
/** The keyed search operation appended to the base URL. */
const KEENABLE_SEARCH_PATH = "/v1/search";
/** The keyless search operation; requires the `X-Keenable-Title` header. */
const KEENABLE_PUBLIC_SEARCH_PATH = "/v1/search/public";
/** The keyed fetch operation appended to the base URL. */
const KEENABLE_FETCH_PATH = "/v1/fetch";
/** The keyless fetch operation; requires the `X-Keenable-Title` header. */
const KEENABLE_PUBLIC_FETCH_PATH = "/v1/fetch/public";
/** Default retrieval mode: deeper retrieval. */
const KEENABLE_DEFAULT_MODE = "pro";
/** Application name sent on keyless calls; Keenable rejects the public endpoints without it. */
const KEENABLE_DEFAULT_APP_TITLE = "deepseek-harness";
/** Default `max_chars` per fetched page (Keenable's own default). */
const KEENABLE_DEFAULT_MAX_CHARS = 50000;
/**
 * Whether a fetch pulls the live source (Keenable's `live=true`) instead of
 * the indexed copy. Defaults to `true` because this provider replaces the
 * local HTTP fetcher, which always reads the live source; the indexed copy
 * fails for URLs Keenable has not indexed.
 */
const KEENABLE_DEFAULT_LIVE = true;
/** Keenable's accepted `snippet_max_length` bounds (characters). */
const KEENABLE_MIN_SNIPPET_LENGTH = 180;
const KEENABLE_MAX_SNIPPET_LENGTH = 10000;
/** Keenable's accepted `max_results` upper bound; the seam still caps on return. */
const KEENABLE_MAX_RESULTS = 50;
/** Attribution header sent on every request. */
const USER_AGENT = "dsh-web-search-keenable/1.0.6";
/** Launch-environment variable naming the Keenable API key credential. */
const KEENABLE_API_KEY_ENV = "KEENABLE_API_KEY";
/**
 * Return the first non-blank string among `values`, or `undefined`.
 *
 * Keenable results may carry only one of `snippet` or `description`, and either
 * may be present but blank, so the mapping treats blank text as absent.
 */
function firstNonBlank(...values) {
	for (const value of values) {
		if (value != null && value.trim().length > 0) return value;
	}
	return void 0;
}
/**
 * Map one Keenable result to a normalized source, or `undefined` when it
 * carries no portable snippet (an entry with neither a non-blank `snippet` nor
 * a non-blank `description` is dropped — the seam has no other field to derive
 * a snippet from, and inventing one would lie).
 *
 * @param result - one entry of Keenable's `results[]`.
 * @returns the normalized source, or `undefined` when the entry has no
 *   non-blank `snippet`/`description`.
 */
function mapKeenableResult(result) {
	const snippet = firstNonBlank(result.snippet, result.description);
	if (snippet === void 0) return void 0;
	return {
		url: result.url,
		...result.title != null && result.title.length > 0 ? { title: result.title } : {},
		snippet,
		...result.published_at != null && result.published_at.length > 0 ? { publishedAt: result.published_at } : {}
	};
}
/**
 * Map a Keenable response envelope to a normalized search result.
 *
 * @param response - the parsed `POST /v1/search` (or `/v1/search/public`) body.
 * @returns the normalized result; snippet-less entries are dropped
 *   ({@link mapKeenableResult}).
 */
function mapKeenableResponse(response) {
	return {
		sources: (response.results ?? []).map(mapKeenableResult).filter((source) => source !== void 0),
		truncated: false
	};
}
/**
 * Map a Keenable fetch response envelope to a normalized fetch result.
 *
 * Keenable returns the page as markdown, which the seam classifies as `text`.
 * The envelope carries no target-page status code, so a successful call maps to
 * `200` — an unreachable or unextractable page surfaces as a Keenable API
 * error instead. Keenable's `max_chars` is a soft cap (it may return somewhat
 * more), so the provider slices `content` to `maxChars` itself — the same
 * discipline the local HTTP fetcher applies — and flags `truncated` only when
 * it actually cut.
 *
 * @param response - the parsed `GET /v1/fetch` (or `/v1/fetch/public`) body.
 * @param requestUrl - the URL the request asked for, used when the envelope
 *   carries none.
 * @param maxChars - the `max_chars` the request sent, for truncation inference.
 * @returns the normalized fetch result.
 */
function mapKeenableFetch(response, requestUrl, maxChars) {
	const raw = response.content ?? "";
	const truncated = maxChars !== void 0 && raw.length > maxChars;
	return {
		url: response.url != null && response.url.length > 0 ? response.url : requestUrl,
		statusCode: 200,
		body: {
			kind: "text",
			content: truncated ? raw.slice(0, maxChars) : raw
		},
		truncated
	};
}
/**
 * Describe a non-2xx Keenable response as one message, best effort.
 *
 * The body is read once as text so both the `{ error, message }` JSON envelope
 * and a plain-text failure stay readable; an aborted read surfaces as
 * `WEB_ABORTED` like every other cancellation in this package.
 */
async function describeKeenableError(response) {
	const fallback = `Keenable API error (HTTP ${response.status})`;
	let text;
	try {
		text = await response.text();
	} catch (error) {
		if (isAbortError(error)) throw new WebError("Keenable request aborted", "WEB_ABORTED", { cause: error });
		return fallback;
	}
	const trimmed = text.trim();
	if (trimmed.length === 0) return fallback;
	try {
		const parsed = JSON.parse(trimmed);
		const detail = parsed?.error ?? parsed?.message;
		if (detail != null && detail.length > 0) return detail;
	} catch {
	}
	return trimmed;
}
/**
 * Parse and policy-check one fetch request URL before any network call.
 *
 * Only http(s) URLs reach Keenable; anything else is a request-shape error,
 * not a provider failure.
 */
function parseFetchUrl(input) {
	if (!URL.canParse(input)) throw new WebError(`invalid URL: ${input}`, "WEB_INVALID_URL");
	const url = new URL(input);
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new WebError(`unsupported URL scheme "${url.protocol}" (only http and https are allowed)`, "WEB_INVALID_URL");
	}
	return url;
}
/** The Keenable-backed search provider; HTTP redirects fail as `WEB_PROVIDER_ERROR`. */
var KeenableSearchProvider = class {
	resolveOptions;
	id = "keenable";
	/**
	 * @param resolveOptions - a thunk snapshotted once at each operation's
	 *   entry, so one search never mixes two config sections and a settings
	 *   change reaches the next call without re-registering the provider —
	 *   a re-registration would make the seam's selection observable to the
	 *   user as a flicker.
	 */
	constructor(resolveOptions) {
		this.resolveOptions = resolveOptions;
	}
	available() {
		const options = this.resolveOptions();
		return this.hasCredentials(options) && isValidBaseUrl(options.baseURL) && (options.maxResults === void 0 || isPositiveInteger(options.maxResults)) && (options.snippetMaxLength === void 0 || isValidSnippetLength(options.snippetMaxLength));
	}
	async search(request, signal) {
		const options = this.resolveOptions();
		const apiKey = await options.resolveApiKey();
		const keyed = apiKey !== void 0 && apiKey.length > 0;
		const requested = request.maxResults ?? options.maxResults;
		const maxResults = requested === void 0 ? void 0 : clampResultCount(requested);
		let response;
		try {
			response = await fetch(`${options.baseURL}${keyed ? KEENABLE_SEARCH_PATH : KEENABLE_PUBLIC_SEARCH_PATH}`, {
				method: "POST",
				redirect: "error",
				headers: this.headers(options, keyed, apiKey),
				body: JSON.stringify({
					query: request.query,
					mode: options.mode,
					...maxResults !== void 0 ? { max_results: maxResults } : {},
					...options.snippetMaxLength !== void 0 ? { snippet_max_length: options.snippetMaxLength } : {},
					...options.site !== void 0 ? { site: options.site } : {}
				}),
				...signal !== void 0 ? { signal } : {}
			});
		} catch (error) {
			if (isAbortError(error)) throw new WebError("Keenable search aborted", "WEB_ABORTED", { cause: error });
			throw new WebError(`Keenable search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
		}
		if (!response.ok) {
			throw new WebError(await describeKeenableError(response), "WEB_PROVIDER_ERROR");
		}
		try {
			return mapKeenableResponse(await response.json());
		} catch (error) {
			if (isAbortError(error)) throw new WebError("Keenable search aborted", "WEB_ABORTED", { cause: error });
			throw new WebError(`Keenable returned an unprocessable response body: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
		}
	}
	/** True when a keyed or keyless (titled) call can be sent. */
	hasCredentials(options) {
		return options.apiKeyState.value.length > 0 || options.appTitle.length > 0;
	}
	/** Request headers for the keyed or keyless operation. */
	headers(options, keyed, apiKey) {
		return {
			...keyed ? { "x-api-key": apiKey } : { "x-keenable-title": options.appTitle },
			"content-type": "application/json",
			accept: "application/json",
			"user-agent": USER_AGENT
		};
	}
};
/** The Keenable-backed fetch provider; HTTP redirects fail as `WEB_PROVIDER_ERROR`. */
var KeenableFetchProvider = class {
	resolveOptions;
	id = "keenable";
	/**
	 * @param resolveOptions - a thunk snapshotted once at each operation's
	 *   entry; see {@link KeenableSearchProvider}.
	 */
	constructor(resolveOptions) {
		this.resolveOptions = resolveOptions;
	}
	available() {
		const options = this.resolveOptions();
		if (options.apiKeyState.value.length === 0 && options.appTitle.length === 0) return false;
		return isValidBaseUrl(options.baseURL) && isPositiveInteger(options.maxChars);
	}
	async fetch(request, signal) {
		const options = this.resolveOptions();
		const target = parseFetchUrl(request.url);
		const apiKey = await options.resolveApiKey();
		const keyed = apiKey !== void 0 && apiKey.length > 0;
		const url = new URL(`${options.baseURL}${keyed ? KEENABLE_FETCH_PATH : KEENABLE_PUBLIC_FETCH_PATH}`);
		url.searchParams.set("url", target.toString());
		url.searchParams.set("max_chars", String(options.maxChars));
		url.searchParams.set("live", String(options.live));
		let response;
		try {
			response = await fetch(url, {
				method: "GET",
				redirect: "error",
				headers: {
					...keyed ? { "x-api-key": apiKey } : { "x-keenable-title": options.appTitle },
					accept: "application/json",
					"user-agent": USER_AGENT
				},
				...signal !== void 0 ? { signal } : {}
			});
		} catch (error) {
			if (isAbortError(error)) throw new WebError("Keenable fetch aborted", "WEB_ABORTED", { cause: error });
			throw new WebError(`Keenable fetch request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
		}
		if (!response.ok) {
			throw new WebError(await describeKeenableError(response), "WEB_PROVIDER_ERROR");
		}
		try {
			return mapKeenableFetch(await response.json(), target.toString(), options.maxChars);
		} catch (error) {
			if (isAbortError(error)) throw new WebError("Keenable fetch aborted", "WEB_ABORTED", { cause: error });
			throw new WebError(`Keenable returned an unprocessable response body: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
		}
	}
};
/** True when `baseURL` parses as an absolute URL (a cheap local config check). */
function isValidBaseUrl(baseURL) {
	return URL.canParse(baseURL);
}
/** True for a result-count control Keenable accepts (a positive whole number). */
function isPositiveInteger(value) {
	return Number.isInteger(value) && value > 0;
}
/** True for a `snippet_max_length` within Keenable's accepted bounds. */
function isValidSnippetLength(value) {
	return Number.isInteger(value) && value >= 180 && value <= 10000;
}
/** Clamp a requested result count into Keenable's accepted 1..50 range. */
function clampResultCount(value) {
	return Math.min(50, Math.max(1, Math.round(value)));
}
/** True for a fetch/`AbortSignal` abort, surfaced as `WEB_ABORTED`. */
function isAbortError(error) {
	return error instanceof DOMException && error.name === "AbortError";
}
/**
 * Create the API-key access both providers share.
 *
 * A non-empty literal `apiKey` wins; otherwise the key resolves through the
 * credentials service — the provider-managed store first, then ambient
 * fallbacks such as the process environment — or, when no credentials service
 * is mounted, straight from the launch environment. Resolution is
 * asynchronous, so a synchronous snapshot answers `available()`; it is seeded
 * once and refreshed whenever the credential or the config can have changed —
 * a committed credential write (`credentials/reference-updated`) or a
 * volatile-only config update (`loader/volatile-update`).
 *
 * @param ctx - plugin context supplying the credential and environment planes.
 * @param options - thunks reading the live literal key and the credential reference name.
 * @returns the per-operation resolver and the synchronous snapshot.
 */
function createApiKeyAccess(ctx, options) {
	const resolveApiKey = async () => {
		const literal = options.literal();
		if (literal !== void 0) return literal;
		const envName = options.envName();
		const ref = isCredentialRefName(envName) ? credentialRef(envName) : void 0;
		const credentials = ctx.get("credentials");
		if (credentials !== void 0) {
			if (ref === void 0) return void 0;
			return (await credentials.resolve(ref))?.value;
		}
		const ambient = launchEnvironmentOf(ctx).get(envName);
		return ambient !== void 0 && ambient.value.length > 0 ? ambient.value : void 0;
	};
	const apiKeyState = { value: options.literal() ?? launchEnvironmentOf(ctx).get(options.envName())?.value ?? "" };
	const refresh = async () => {
		try {
			apiKeyState.value = (await resolveApiKey()) ?? "";
		} catch {
			// a failed resolution keeps the previous snapshot; the next operation resolves again
		}
	};
	void refresh();
	ctx.on("credentials/reference-updated", () => void refresh());
	ctx.on("loader/volatile-update", () => void refresh());
	return { resolveApiKey, apiKeyState };
}
/**
 * Keenable-backed `ctx.web` plugin. It registers a search provider and a fetch
 * provider into the web seam without owning the service; both share the same
 * credential resolution (a literal key, the credentials service, or the launch
 * environment — and an app title for the keyless endpoints).
 *
 * @module @customize/dsh-web-search-keenable
 */
/** Cordis plugin name used by loader diagnostics. */
const name = "web-search-keenable";
/** The web seam this provider registers into. */
const inject = ["web"];
const Config = z.object({
	apiKey: z.string().role("secret").volatile(),
	apiKeyEnv: z.string().role("credential-ref").default(KEENABLE_API_KEY_ENV).volatile(),
	baseURL: z.string().volatile(),
	mode: z.union([
		"pro",
		"realtime"
	]).volatile(),
	appTitle: z.string().volatile(),
	site: z.string().volatile(),
	maxResults: z.number().step(1).min(1).max(50).volatile(),
	snippetMaxLength: z.number().step(1).min(180).max(10000).volatile(),
	maxChars: z.number().step(1).min(1).default(50000).volatile(),
	live: z.boolean().default(true).volatile()
});
/** A non-empty literal key, or `undefined` so resolution falls through. */
function literalApiKey(value) {
	return value !== void 0 && value.length > 0 ? value : void 0;
}
/**
 * Project the live config into the options the providers serve their next
 * operation with. Every field is read through its volatile reference, so a
 * config change reaches the next call without re-registering the providers —
 * a re-registration would make the seam's selection observable to the user
 * as a flicker. Environment fallbacks stay here rather than in the
 * providers: every value they read is already fully defaulted.
 *
 * @param ctx - plugin context supplying the environment plane.
 * @param config - the live config; each field is a volatile reference.
 * @param apiKeyAccess - the credential access both providers share.
 * @returns options for one operation.
 */
function resolveOptions(ctx, config, apiKeyAccess) {
	const mode = config.mode.get();
	const maxResults = config.maxResults.get();
	const snippetMaxLength = config.snippetMaxLength.get();
	const site = config.site.get();
	return {
		...apiKeyAccess,
		baseURL: config.baseURL.get() ?? KEENABLE_DEFAULT_BASE_URL,
		appTitle: config.appTitle.get() ?? launchEnvironmentOf(ctx).get("KEENABLE_APP_TITLE")?.value ?? KEENABLE_DEFAULT_APP_TITLE,
		mode: mode ?? KEENABLE_DEFAULT_MODE,
		...maxResults !== void 0 ? { maxResults } : {},
		...snippetMaxLength !== void 0 ? { snippetMaxLength } : {},
		...site !== void 0 ? { site } : {},
		maxChars: config.maxChars.get(),
		live: config.live.get()
	};
}
/**
 * Register the Keenable search and fetch providers with `ctx.web`.
 *
 * With a key both call the keyed endpoints; without one they call the keyless
 * public endpoints, which need `appTitle` (defaulting to
 * `$KEENABLE_APP_TITLE`, then a constant) for their `X-Keenable-Title` header.
 * The key itself resolves per operation — a literal `apiKey` first, then the
 * `KEENABLE_API_KEY` credential reference (credentials service, then launch
 * environment) — so a key stored or changed after startup reaches the next
 * call without a restart. Every config field is volatile, so the same holds
 * for endpoint, mode, and limit changes: the loader commits them into the
 * running references instead of restarting the plugin.
 */
function apply(ctx, config) {
	const apiKeyAccess = createApiKeyAccess(ctx, {
		literal: () => literalApiKey(config.apiKey.get()),
		envName: () => config.apiKeyEnv.get() ?? KEENABLE_API_KEY_ENV
	});
	ctx.web.registerSearchProvider(new KeenableSearchProvider(() => resolveOptions(ctx, config, apiKeyAccess)));
	ctx.web.registerFetchProvider(new KeenableFetchProvider(() => resolveOptions(ctx, config, apiKeyAccess)));
}
export { Config, KEENABLE_DEFAULT_APP_TITLE, KEENABLE_DEFAULT_BASE_URL, KEENABLE_DEFAULT_LIVE, KEENABLE_DEFAULT_MAX_CHARS, KEENABLE_DEFAULT_MODE, KEENABLE_FETCH_PATH, KEENABLE_MAX_RESULTS, KEENABLE_PROVIDER_ID, KEENABLE_PUBLIC_FETCH_PATH, KEENABLE_PUBLIC_SEARCH_PATH, KEENABLE_SEARCH_PATH, KeenableFetchProvider, KeenableSearchProvider, apply, inject, name };
