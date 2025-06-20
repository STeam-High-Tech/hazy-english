# Sử dụng Python 3.9 slim image để giảm kích thước
FROM python:3.9-slim as builder

# Cài đặt các gói cần thiết để build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /app

# Copy các file cần thiết
COPY requirements.txt .
COPY hazy_eng.py .

# Cài đặt các phụ thuộc và PyInstaller
RUN pip install --no-cache-dir -r requirements.txt pyinstaller

# Build ứng dụng
RUN pyinstaller --onefile --name=hazy_eng hazy_eng.py

# Stage cuối cùng để tạo image nhẹ hơn
FROM python:3.9-slim

# Copy binary từ stage builder
COPY --from=builder /app/dist/hazy_eng /usr/local/bin/hazy_eng

# Đảm bảo binary có quyền thực thi
RUN chmod +x /usr/local/bin/hazy_eng

# Thư mục làm việc
WORKDIR /data

# Command mặc định khi chạy container
CMD ["hazy_eng"]
