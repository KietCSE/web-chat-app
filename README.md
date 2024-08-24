npm init (khởi tạo package nodejs)
npm install express (cài đặt express) => node index.js to run 
npm install nodemon --save-dev => cài đặt tool tự reset server 
npm install morgan --save-dev (lưu lại các log từ http) 
npm install express-handlebars 
- Cấu hình handlerbars gồm có: 
  + Views: thư mục lớn 
  + layouts: chứa các layout dành cho các admin, user,... 
  + partils: chứa các thành phần được sử dụng lại nhiều lần vd header, menu,...
  + các file view: chứ các file sẽ render 

config scss 
npm install node-sass --save-dev 
"watch": "node-sass -w src/resources/scss/app.scss src/public/css/app.css"
