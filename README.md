# NAU Timeline — Một ngày ở Trường Đại học Nghệ An

**NAU Timeline** là một dự án website tĩnh được thực hiện cho môn học **Thiết kế web**, Khoa Công nghệ Thông tin, Trường Đại học Nghệ An. Trang web kể lại nhịp sinh hoạt quen thuộc của sinh viên Trường Đại học Nghệ An (NAU) thông qua **8 mốc giờ** trong ngày, từ 06:00 sáng đến 22:00 đêm.

*   **Website trực tuyến:** [https://vietlay250107-code.github.io/nau-timeline/](https://vietlay250107-code.github.io/nau-timeline/)
*   **Kho mã nguồn:** [https://github.com/vietlay250107-code/nau-timeline](https://github.com/vietlay250107-code/nau-timeline)

### 🌟 Điểm nổi bật của dự án
*   **Giao diện thay đổi theo thời gian thực:** Màu sắc bầu trời (biến `--sky-top`, `--sky-bottom`) chuyển đổi theo từng mốc giờ khi người dùng cuộn tới cảnh tương ứng, với hiệu ứng chuyển màu 800ms (`sky.js`).
*   **Đồng hồ lật số & Thiên thể:** Đồng hồ ở góc phải tự động lật số theo từng mốc giờ (`clock.js`). Đồng thời, mặt trời và mặt trăng ở góc trái cũng di chuyển theo tiến độ cuộn trang (`orb.js`).
*   **Tương tác đa dạng:** Tích hợp bài trắc nghiệm ngắn (Quiz) gồm 3 câu hỏi giúp người xem kiểm tra lại trí nhớ về hành trình (`quiz.js`).
*   **Điều hướng mốc giờ nhanh:** Thanh chấm giúp chuyển tới tám cảnh và làm nổi bật mốc đang xem (`dot-nav.js`).
*   **Dẫn tour tự động:** Tự cuộn qua tám mốc, có thể tạm dừng, hỗ trợ bàn phím và chế độ giảm chuyển động (`tour.js`).
*   **Vé ngày học cá nhân:** Tạo, xem trước và tải vé PNG với mốc giờ, ảnh và lời nhắn tùy chọn (`ticket.js`).
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
│   ├── img/       # Hình ảnh đã tối ưu cho các mốc thời gian, bản đồ và ảnh xem trước
│   └── logo/      # Logo trường NAU và thư mục archive/ lưu bản gốc
├── css/
│   ├── style.css        # Style chung toàn trang
│   ├── core.css         # Style cho đồng hồ, tiến trình, quiz
│   ├── features.css     # Style cho thanh mốc giờ, dẫn tour và vé cá nhân
│   ├── gioi-thieu.css   # Style cho phần giới thiệu dự án
│   └── responsive.css   # Style cho các kích thước màn hình
├── js/
│   ├── nav.js       # Xử lý thanh điều hướng
│   ├── sky.js       # Xử lý đổi màu bầu trời
│   ├── clock.js     # Xử lý đồng hồ lật số
│   ├── orb.js       # Xử lý mặt trời/mặt trăng
│   ├── progress.js  # Xử lý thanh tiến trình
│   ├── quiz.js      # Xử lý bài trắc nghiệm
│   ├── dot-nav.js   # Điều hướng nhanh giữa tám mốc giờ
│   ├── tour.js      # Dẫn tour tự động qua các cảnh
│   ├── ticket.js    # Tạo và xuất vé ngày học dạng PNG
│   └── gioi-thieu.js # Xử lý hiệu ứng reveal
├── index.html       # Trang chủ (Dòng thời gian)
├── ban-do.html      # Trang bản đồ khuôn viên
└── 404.html         # Trang thông báo lỗi 404
```
