# NAU Timeline — Một ngày ở Trường Đại học Nghệ An

**NAU Timeline** là một dự án website tĩnh được thực hiện cho môn học **Thiết kế Web**. Trang web kể lại nhịp sinh hoạt quen thuộc của sinh viên Trường Đại học Nghệ An (NAU) thông qua **8 mốc giờ** trong ngày, từ 06:00 sáng đến 22:00 đêm.

### 🌟 Điểm nổi bật của dự án
*   **Giao diện thay đổi theo thời gian thực:** Màu sắc bầu trời (biến `--sky-top`, `--sky-bottom`) tự động chuyển đổi mượt mà từ sắc sáng sớm, nắng trưa, hoàng hôn đến nền đêm tối dựa trên vị trí cuộn trang của người dùng (`sky.js`).
*   **Đồng hồ lật số & Thiên thể:** Đồng hồ ở góc phải tự động lật số theo từng mốc giờ (`clock.js`). Đồng thời, mặt trời và mặt trăng ở góc trái cũng di chuyển theo tiến độ cuộn trang (`orb.js`).
*   **Tương tác đa dạng:** Tích hợp bài trắc nghiệm ngắn (Quiz) gồm 3 câu hỏi giúp người xem kiểm tra lại trí nhớ về hành trình (`quiz.js`).
*   **Thiết kế Responsive:** Sử dụng Bootstrap 5 kết hợp CSS tùy chỉnh để hiển thị tốt trên mọi kích thước màn hình.
*   **Trang bản đồ riêng:** Trang `ban-do.html` giới thiệu sơ đồ khuôn viên trường.

### 🛠 Công nghệ sử dụng
*   **HTML5**: Cấu trúc ngữ nghĩa (Semantic HTML).
*   **CSS3**: Tùy chỉnh giao diện, sử dụng CSS Variables, Flexbox, Grid và các hiệu ứng chuyển động.
*   **JavaScript (Vanilla)**: Xử lý logic cuộn trang, thay đổi màu sắc, đồng hồ, quiz và các hiệu ứng tương tác.
*   **Bootstrap 5**: Hệ thống lưới (Grid) và các component cơ bản.

### 📁 Cấu trúc thư mục
```text
├── assets/
│   ├── img/       # Hình ảnh cho các mốc thời gian và bản đồ
│   └── logo/      # Logo trường NAU
├── css/
│   ├── style.css        # Style chung toàn trang
│   ├── core.css         # Style cho đồng hồ, tiến trình, quiz
│   ├── gioi-thieu.css   # Style cho phần giới thiệu dự án
│   └── responsive.css   # Style cho các kích thước màn hình
├── js/
│   ├── nav.js       # Xử lý thanh điều hướng
│   ├── sky.js       # Xử lý đổi màu bầu trời
│   ├── clock.js     # Xử lý đồng hồ lật số
│   ├── orb.js       # Xử lý mặt trời/mặt trăng
│   ├── progress.js  # Xử lý thanh tiến trình
│   ├── quiz.js      # Xử lý bài trắc nghiệm
│   └── gioi-thieu.js # Xử lý hiệu ứng reveal
├── index.html       # Trang chủ (Dòng thời gian)
└── ban-do.html      # Trang bản đồ khuôn viên