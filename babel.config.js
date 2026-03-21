// babel.config.js — 供 Jest / babel-jest 使用（Vite 构建不依赖此文件）
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
};
