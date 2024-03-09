   

es-pkg
======

组件打包工具

[![NPM Version](https://camo.githubusercontent.com/87e231f6c9c425b8388e50d5b37d2712ca941d75263a1f2cc0c4f3e277a5fe4f/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f65732d706b673f636f6c6f723d333363643536266c6f676f3d6e706d)](https://www.npmjs.com/package/es-pkg)

📦 **Installation**
-------------------

    npm install es-pkg

🔨 **Usage**
------------

see demo

👊 Exports
----------

### 

<table><thead><tr><th>参数</th><th>类型</th></tr></thead><tbody><tr><td><a href="" class="tsd-index-link"><svg viewBox="0 0 24 24"><rect fill="#f2f4f8" stroke="var(--color-ts-interface)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><path d="M9.51 16V15.016H11.298V8.224H9.51V7.24H14.19V8.224H12.402V15.016H14.19V16H9.51Z" fill="#222"></path></svg><span>EsPkgConfig</span></a></td><td><code>Interfaces</code></td></tr><tr><td><a href="" class="tsd-index-link"><svg viewBox="0 0 24 24"><rect fill="#f2f4f8" stroke="var(--color-ts-function)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><path d="M9.39 16V7.24H14.55V8.224H10.446V11.128H14.238V12.112H10.47V16H9.39Z" fill="#222"></path></svg><span>defineConfig</span></a></td><td><code>Functions</code></td></tr></tbody></table>

**Interfaces**
--------------

#### EsPkgConfig

<table><thead><tr><th>参数</th><th>类型</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><span class="tsd-kind-property">dist</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code></div></td><td><div class="tsd-comment tsd-typography">dist 目录</div></td><td>```ts 默认为./dist ```</td></tr><tr><td><span class="tsd-kind-property">doc</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code><span class="tsd-signature-symbol"> | </span><code class="tsd-signature-type">Partial</code><span class="tsd-signature-symbol">&lt;</span><code class="tsd-signature-type">DocOptions</code><span class="tsd-signature-symbol">&gt;</span></div></td><td><div class="tsd-comment tsd-typography">md文档名称</div></td><td>```ts 默认为 README ```</td></tr><tr><td><span class="tsd-kind-property">entry</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code></div></td><td><div class="tsd-comment tsd-typography">入口</div></td><td>```ts 默认为./src/index.tsx ```</td></tr><tr><td><span class="tsd-kind-property">entryCss</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <span class="tsd-signature-symbol">[</span><span class="tsd-signature-symbol">]</span></div></td><td></td><td></td></tr><tr><td><span class="tsd-kind-property">es</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code></div></td><td><div class="tsd-comment tsd-typography">es 目录</div></td><td>```ts 默认为./es ```</td></tr><tr><td><span class="tsd-kind-property">lib</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code></div></td><td><div class="tsd-comment tsd-typography">lib 目录</div></td><td>```ts 默认为./lib ```</td></tr><tr><td><span class="tsd-kind-property">publishDir</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code></div></td><td><div class="tsd-comment tsd-typography">npm发布目录</div></td><td>```ts 默认为../${pkg.name}-npm ```</td></tr><tr><td><span class="tsd-kind-property">src</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code></div></td><td><div class="tsd-comment tsd-typography">src 目录</div></td><td>```ts 默认为./src ```</td></tr><tr><td><span class="tsd-kind-property">typings</span></td><td><a class="tsd-anchor"></a><div class="tsd-signature"><span class="tsd-signature-symbol">?:</span> <code class="tsd-signature-type">string</code></div></td><td><div class="tsd-comment tsd-typography">声明 目录</div></td><td>```ts 默认为./typings ```</td></tr></tbody></table>

**Functions**
-------------

#### defineConfig

*   defineConfig(config:EsPkgConfig): EsPkgConfig