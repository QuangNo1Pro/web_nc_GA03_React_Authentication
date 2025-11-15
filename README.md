# Đăng ký và Xác thực Người dùng

Đây là một ứng dụng full-stack để đăng ký và xác thực người dùng, được xây dựng bằng React và NestJS. Nó cung cấp một hệ thống hoàn chỉnh để người dùng đăng ký, đăng nhập và truy cập các tài nguyên được bảo vệ, với một backend hiện đại và an toàn.

## Công nghệ sử dụng

### Frontend

* **React:** Một thư viện JavaScript để xây dựng giao diện người dùng.
* **TypeScript:** Một tập hợp con của JavaScript có kiểu dữ liệu và được biên dịch thành JavaScript thuần.
* **Vite:** Một công cụ xây dựng và máy chủ phát triển nhanh cho các dự án web hiện đại.
* **React Router v6:** Một thư viện định tuyến khai báo cho React.
* **TanStack Query:** Một thư viện quản lý trạng thái và tìm nạp dữ liệu mạnh mẽ cho React.
* **Axios:** Một HTTP client dựa trên promise cho trình duyệt và Node.js.
* **Tailwind CSS:** Một framework CSS ưu tiên tiện ích để phát triển giao diện người dùng nhanh chóng.
* **React Hook Form:** Một thư viện để xây dựng các biểu mẫu hiệu suất và linh hoạt trong React.

### Backend

* **NestJS:** Một framework Node.js tiến bộ để xây dựng các ứng dụng phía máy chủ hiệu quả, đáng tin cậy và có khả năng mở rộng.
* **TypeScript:** Một tập hợp con của JavaScript có kiểu dữ liệu và được biên dịch thành JavaScript thuần.
* **MongoDB:** Một chương trình cơ sở dữ liệu hướng tài liệu, đa nền tảng.
* **Mongoose:** Một công cụ lập mô hình đối tượng MongoDB thanh lịch cho Node.js.
* **Passport.js:** Một middleware xác thực đơn giản, không phô trương cho Node.js.
* **JWT & Local Strategy:** Các chiến lược của Passport.js để xác thực bằng tên người dùng và mật khẩu và bằng JSON Web Tokens.
* **bcrypt:** Một thư viện để băm mật khẩu.

## Tính năng

* **Đăng ký người dùng:** Người dùng mới có thể tạo tài khoản bằng một email duy nhất và mật khẩu được băm an toàn trước khi được lưu trữ trong cơ sở dữ liệu.
* **Đăng nhập người dùng:** Người dùng đã đăng ký có thể đăng nhập bằng email và mật khẩu của họ để nhận được một access token và một refresh token.
* **Xác thực dựa trên token:** Ứng dụng sử dụng JSON Web Tokens (JWTs) để bảo mật các điểm cuối API và bảo vệ các tuyến đường.
* **Tự động làm mới token:** Khi một access token hết hạn, ứng dụng sẽ tự động sử dụng refresh token để lấy một access token mới mà không làm gián đoạn phiên của người dùng.
* **Các tuyến đường được bảo vệ:** Một số tuyến đường được bảo vệ và chỉ có thể được truy cập bởi những người dùng đã được xác thực.
* **Xử lý lỗi:** Ứng dụng cung cấp các thông báo lỗi có ý nghĩa cho các tình huống phổ biến như đăng nhập không thành công, đầu vào không hợp lệ và token hết hạn.

## Bắt đầu

Để có một bản sao cục bộ và chạy, hãy làm theo các bước đơn giản sau.

### Điều kiện tiên quyết

* **Node.js:** Đảm bảo bạn đã cài đặt Node.js (v18 trở lên) trên máy của mình.
* **npm hoặc Yarn:** Bạn có thể sử dụng npm hoặc Yarn để quản lý các phụ thuộc của dự án.
* **MongoDB:** Bạn cần có một máy chủ MongoDB đang chạy trên máy của mình hoặc có quyền truy cập vào một phiên bản MongoDB trên đám mây.

### Cài đặt Backend

1. **Điều hướng đến thư mục backend:**
    ``sh
    cd backend
    ``
2. **Cài đặt các phụ thuộc:**
    ``sh
    npm install
    ``
3. **Tạo một tệp `.env`** trong thư mục `backend` và thêm các biến môi trường sau:
    ``
   MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRATION_TIME=3600
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRATION_TIME=86400
    ``
4. **Khởi động máy chủ phát triển:**
    ``sh
    npm run start:dev
    ``
    Máy chủ backend sẽ khởi động trên `http://localhost:3000`.

### Cài đặt Frontend

1. **Điều hướng đến thư mục frontend:**
    ``sh
    cd frontend
    ``
2. **Cài đặt các phụ thuộc:**
    ``sh
    npm install
    ``
3. **Tạo một tệp `.env.local`** trong thư mục `frontend` và thêm biến môi trường sau:
    ``
   VITE_API_URL=http://localhost:3000
    ``
4. **Khởi động máy chủ phát triển:**
    ``sh
    npm run dev
    ``
    Ứng dụng frontend sẽ có sẵn tại `http://localhost:5173`.

## Triển khai

Ứng dụng đã được triển khai và có thể truy cập công khai tại các URL sau:

* **Backend (Render):**[ https://web-nc-ga03-react-authentication.onrender.com]
* **Check database Backend (Vercel):**[https://web-nc-ga03-react-authentication.onrender.com/db]
* **Frontend (Vercel):**[https://web-nc-ga-03-react-authentication.vercel.app/]