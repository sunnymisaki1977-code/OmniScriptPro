const str = '[URL: https://www.winnews.com.tw/wp-content/uploads/2026/09/0909-6-1024x576.webp]';
const regex = /https?:\/\/[^\s"'<>\)\]]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s"'<>\)\]]*)?/gi;
console.log(str.match(regex));
