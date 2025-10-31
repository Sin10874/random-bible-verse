/**
 * 脚本：从 Reina-Valera 1960 数据源提取需要的经文
 * 生成 rv1960-map.json 文件
 */

const fs = require('fs');
const path = require('path');

// 读取我们需要的经文列表
const categoriesPath = path.join(__dirname, '../public/verse-categories.json');
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// 收集所有需要的经文引用
const neededVerses = new Set();
Object.values(categories).forEach(cat => {
  if (cat.verses) {
    cat.verses.forEach(v => neededVerses.add(v));
  }
});

console.log(`需要获取 ${neededVerses.size} 个经文`);

// 手动翻译的关键经文（示例 - 我们会逐步添加）
// 这些是从 Reina-Valera 1960 官方译本获取的
const rv1960Verses = {
  // John 约翰福音
  "John 3:16": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
  "John 3:17": "Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él.",
  "John 13:34": "Un mandamiento nuevo os doy: Que os améis unos a otros; como yo os he amado, que también os améis unos a otros.",
  "John 13:35": "En esto conocerán todos que sois mis discípulos, si tuviereis amor los unos con los otros.",
  "John 15:9": "Como el Padre me ha amado, así también yo os he amado; permaneced en mi amor.",
  "John 15:12": "Este es mi mandamiento: Que os améis unos a otros, como yo os he amado.",
  "John 15:13": "Nadie tiene mayor amor que este, que uno ponga su vida por sus amigos.",

  // 1 Corinthians 哥林多前书
  "1 Corinthians 13:4": "El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece;",
  "1 Corinthians 13:5": "no hace nada indebido, no busca lo suyo, no se irrita, no guarda rencor;",
  "1 Corinthians 13:6": "no se goza de la injusticia, mas se goza de la verdad.",
  "1 Corinthians 13:7": "Todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.",
  "1 Corinthians 13:8": "El amor nunca deja de ser; pero las profecías se acabarán, y cesarán las lenguas, y la ciencia acabará.",
  "1 Corinthians 13:13": "Y ahora permanecen la fe, la esperanza y el amor, estos tres; pero el mayor de ellos es el amor.",

  // 1 John 约翰一书
  "1 John 4:7": "Amados, amémonos unos a otros; porque el amor es de Dios. Todo aquel que ama, es nacido de Dios, y conoce a Dios.",
  "1 John 4:8": "El que no ama, no ha conocido a Dios; porque Dios es amor.",
  "1 John 4:9": "En esto se mostró el amor de Dios para con nosotros, en que Dios envió a su Hijo unigénito al mundo, para que vivamos por él.",
  "1 John 4:10": "En esto consiste el amor: no en que nosotros hayamos amado a Dios, sino en que él nos amó a nosotros, y envió a su Hijo en propiciación por nuestros pecados.",
  "1 John 4:11": "Amados, si Dios nos ha amado así, debemos también nosotros amarnos unos a otros.",
  "1 John 4:16": "Y nosotros hemos conocido y creído el amor que Dios tiene para con nosotros. Dios es amor; y el que permanece en amor, permanece en Dios, y Dios en él.",
  "1 John 4:18": "En el amor no hay temor, sino que el perfecto amor echa fuera el temor; porque el temor lleva en sí castigo. De donde el que teme, no ha sido perfeccionado en el amor.",
  "1 John 4:19": "Nosotros le amamos a él, porque él nos amó primero.",

  // Romans 罗马书
  "Romans 5:8": "Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.",
  "Romans 8:38": "Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir,",
  "Romans 8:39": "ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro.",
};

// 保存到文件
const outputPath = path.join(__dirname, '../public/rv1960-map.json');
fs.writeFileSync(outputPath, JSON.stringify(rv1960Verses, null, 2), 'utf8');

console.log(`✅ 已创建 rv1960-map.json，包含 ${Object.keys(rv1960Verses).length} 个经文`);
console.log(`⚠️  还需要添加 ${neededVerses.size - Object.keys(rv1960Verses).length} 个经文`);
console.log('\n缺少的经文引用示例：');
Array.from(neededVerses).slice(0, 10).forEach((ref, i) => {
  if (!rv1960Verses[ref]) {
    console.log(`  ${i + 1}. ${ref}`);
  }
});
