const POSTS_MANIFEST = "/posts.json";
const POSTS_DIR = "/posts/";

function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!match) {
        return { meta: {}, body: raw };
    }
    const [, frontmatter, body] = match;
    const meta = {};
    frontmatter.split("\n").forEach((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if (key === "tags") {
            meta.tags = value.split(",").map((t) => t.trim()).filter(Boolean);
        } else {
            meta[key] = value;
        }
    });
    return { meta, body };
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

async function loadManifest() {
    const res = await fetch(POSTS_MANIFEST);
    if (!res.ok) throw new Error("couldn't load posts.json");
    const posts = await res.json();
    // newest first
    return posts.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function loadPostRaw(slug) {
    const url = `${POSTS_DIR}${slug}.txt`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(
            `couldn't load post "${slug}" (${res.status} ${res.statusText}) from ${url}`
        );
    }

    return res.text();
}

function renderMarkdownWithMath(markdownBody, targetEl) {
    targetEl.innerHTML = marked.parse(markdownBody, {
        breaks: false,
        gfm: true,
    });

    // syntax highlighting
    targetEl.querySelectorAll("pre code").forEach((block) => {
        if (window.hljs) window.hljs.highlightElement(block);
    });

    // LaTeX via KaTeX auto-render
    if (window.renderMathInElement) {
        window.renderMathInElement(targetEl, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "\\[", right: "\\]", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
            ],
            throwOnError: false,
        });
    }
}

function loadStickers(containerId, files, baseUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;
    files.forEach((file) => {
        const img = document.createElement("img");
        img.src = baseUrl + file;
        img.alt = file.replace(/\.[^/.]+$/, "");
        img.loading = "lazy";
        container.appendChild(img);
    });
}

async function renderPostList(targetSelector) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    try {
        const posts = await loadManifest();
        if (!posts.length) {
            el.innerHTML = `<p class="state-msg">no posts yet — check back soon :3</p>`;
            return;
        }
        el.innerHTML = posts
            .map(
                (p) => `
      <article class="post-card">
        <div class="post-date">${formatDate(p.date)}</div>
        <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a></h2>
        <p>${p.excerpt || ""}</p>
        <div class="tag-list">
          ${(p.tags || []).map((t) => `<span class="tag">#${t}</span>`).join("")}
        </div>
      </article>`
            )
            .join("");
    } catch (err) {
        console.error(err);
        el.innerHTML = `<p class="state-msg">couldn't load posts. ${err.message}</p>`;
    }
}

async function renderSinglePost() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    const headerEl = document.querySelector(".post-header");
    const bodyEl = document.querySelector(".post-body");
    const titleTag = document.querySelector("title");

    if (!slug) {
        bodyEl.innerHTML = `<p class="state-msg">no post specified.</p>`;
        return;
    }

    try {
        const [manifest, raw] = await Promise.all([
            loadManifest(),
            loadPostRaw(slug),
        ]);
        const { meta, body } = parseFrontmatter(raw);
        const listing = manifest.find((p) => p.slug === slug) || {};
        const title = meta.title || listing.title || slug;
        const date = meta.date || listing.date || "";
        const tags = meta.tags || listing.tags || [];

        if (titleTag) titleTag.textContent = `${title} — blog`;

        headerEl.innerHTML = `
      <div class="post-date">${formatDate(date)}</div>
      <h1>${title}</h1>
      <div class="tag-list">
        ${tags.map((t) => `<span class="tag">#${t}</span>`).join("")}
      </div>
    `;

        renderMarkdownWithMath(body, bodyEl);

        // prev/next navigation
        const idx = manifest.findIndex((p) => p.slug === slug);
        const prev = manifest[idx + 1]; // older
        const next = manifest[idx - 1]; // newer
        const footerEl = document.querySelector(".post-footer");
        if (footerEl) {
            footerEl.innerHTML = `
        <span>${prev ? `← <a href="post.html?slug=${encodeURIComponent(prev.slug)}">${prev.title}</a>` : ""}</span>
        <span>${next ? `<a href="post.html?slug=${encodeURIComponent(next.slug)}">${next.title}</a> →` : ""}</span>
      `;
        }
    } catch (err) {
        console.error(err);
        bodyEl.innerHTML = `<p class="state-msg">couldn't load this post. ${err.message}</p>`;
    }
}