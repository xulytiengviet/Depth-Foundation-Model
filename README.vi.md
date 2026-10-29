# DeFM — Phòng mô phỏng tiếng Việt

Trang diễn giải và mô phỏng giáo dục về Depth Foundation Model. Mã nguồn Python của dự án gốc được giữ nguyên.

## Chạy ngay

Mở `docs/index.html` bằng trình duyệt hiện đại, hoặc chạy:

```sh
python -m http.server 8000 --directory docs
```

Truy cập `http://localhost:8000`. Không cần npm, GPU, API key hay tải trọng số để chạy mô phỏng.

## Tương tác

- Bốn cảnh: robot mặt đất, Drone, xe tự hành, bản đồ công trình WebGIS.
- Ba cách nhìn: ảnh độ sâu, phân vùng theo vật thể, đám mây điểm bề mặt.
- Điều chỉnh nhiễu và tầm nhìn; tạm dừng, tiếp tục, đặt lại.
- Phép giao tia với hộp 3D và mặt đất tạo bản đồ khoảng cách. Sơ đồ cục bộ minh họa vị trí camera.
- Tự giảm chuyển động khi hệ điều hành yêu cầu, dừng vẽ khi khuất màn hình.

## Phạm vi khoa học

Đây **không phải suy luận DeFM**, không phải benchmark, SLAM hoặc chính sách điều khiển robot. Màu phân vùng lấy từ ID vật thể có sẵn. Các cảnh Drone, xe tự hành, WebGIS và robot môi trường minh họa triển vọng tích hợp, không khẳng định đã được tác giả DeFM kiểm chứng.

Nguồn chính thức công bố 60,4 triệu ảnh độ sâu và 12 mô hình khoảng 3–304 triệu tham số. Bộ mã hóa đóng băng vẫn cần đầu tác vụ/chính sách đã huấn luyện. Một phần dữ liệu là độ sâu ước lượng từ RGB. Bảng phần cứng trên trang dẫn số liệu PyTorch tại 224×224, Jetson Orin lô 1, không phải độ trễ đầu-cuối.

Số 80,9% / 68,9% trong bản giới thiệu ban đầu không được đưa vào giao diện do chưa xác minh được từ phiên bản tài liệu đã kiểm tra; hiệu suất gắp vật được diễn giải theo chuẩn hóa giáo viên.

## GitHub Pages

Workflow `.github/workflows/pages.yml` triển khai thư mục `docs` khi nội dung thay đổi trên `main`.

Nếu Pages chưa được bật: **Settings → Pages → Build and deployment → Source: GitHub Actions**, sau đó chạy workflow “Trang mô phỏng DeFM tiếng Việt”. Có thể dùng phương án **Deploy from a branch → main → /docs** nếu không dùng Actions.

Đường dẫn dự kiến sau khi triển khai thành công: https://xulytiengviet.github.io/Depth-Foundation-Model/

## Nguồn

- https://de-fm.github.io/
- https://arxiv.org/abs/2601.18923
- https://github.com/leggedrobotics/defm
- https://huggingface.co/leggedrobotics/defm

Nội dung tiếng Việt được biên soạn độc lập; không đại diện ETH Zurich. Giữ giấy phép Apache-2.0 và ghi nhận tác giả của mã DeFM gốc. Trang mới không sao chép ảnh/video của dự án gốc.
