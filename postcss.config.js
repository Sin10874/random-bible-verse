// postcss.config.js
module.exports = {
    plugins: {
      "@tailwindcss/postcss": {}, // 👈 v4 新插件（不要再写 tailwindcss: {}）
      autoprefixer: {},
    },
  };
  