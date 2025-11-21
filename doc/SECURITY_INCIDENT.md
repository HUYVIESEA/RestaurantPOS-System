# 🚨 CẢNH BÁO BẢO MẬT - HÀNH ĐỘNG KHẨN CẤP

## ⚠️ VẤN ĐỀ PHÁT HIỆN

GitGuardian đã phát hiện **credentials bị lộ** trong repository GitHub của bạn:

### Thông tin bị lộ:
- **File:** `.env`
- **Loại:** Gmail App Password
- **Email:** hhuy0847@gmail.com
- **Password:** `wknm mmid kdev hgdy`
- **Ngày push:** 17/11/2025

---

## 🔥 HÀNH ĐỘNG KHẨN CẤP (THỰC HIỆN NGAY)

### Bước 1: Thu hồi Gmail App Password (5 phút)

1. **Truy cập:** https://myaccount.google.com/apppasswords
2. **Đăng nhập** với email: hhuy0847@gmail.com
3. **Xóa** App Password có tên "Restaurant POS" hoặc tất cả
4. **Tạo mới** App Password khác

### Bước 2: Xóa file .env khỏi Git History (10 phút)

⚠️ **QUAN TRỌNG:** File `.env` đã bị commit vào Git history!

**Option 1: Xóa toàn bộ history (Đơn giản nhưng mất lịch sử)**
```bash
# Backup code hiện tại
cd ..
cp -r RestaurantPOS-System RestaurantPOS-System-backup

# Xóa .git và tạo repo mới
cd RestaurantPOS-System
rm -rf .git
git init
git add .
git commit -m "Initial commit with security fixes"
git remote add origin https://github.com/HUYVESEA0/RestaurantPOS-System.git
git push -f origin main
```

**Option 2: Dùng BFG Repo-Cleaner (Giữ lịch sử)**
```bash
# Download BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Xóa file .env khỏi history
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Bước 3: Cập nhật .gitignore

Đảm bảo `.env` trong `.gitignore`:
```bash
# Environment files
.env
.env.local
.env.*.local
*.env
```

### Bước 4: Tạo .env mới với credentials mới

```bash
# Tạo .env mới với App Password MỚI
cp .env .env.example  # Backup template
# Cập nhật EMAIL_SMTP_PASSWORD với password MỚI
```

---

## 📋 CHECKLIST BẢO MẬT

### Ngay lập tức (0-30 phút)
- [ ] Thu hồi Gmail App Password cũ
- [ ] Tạo Gmail App Password mới
- [ ] Xóa `.env` khỏi Git history
- [ ] Cập nhật `.gitignore`
- [ ] Push changes

### Trong 24 giờ
- [ ] Kiểm tra Git history đã sạch
- [ ] Đổi JWT_SECRET_KEY
- [ ] Đổi tất cả passwords trong .env
- [ ] Review tất cả commits gần đây

### Dài hạn
- [ ] Thiết lập pre-commit hooks
- [ ] Sử dụng secret management service
- [ ] Enable 2FA cho GitHub
- [ ] Regular security audits

---

## 🔒 NGĂN CHẶN TƯƠNG LAI

### 1. Sử dụng .env.example
```bash
# .env.example (commit được)
EMAIL_SMTP_PASSWORD=your_app_password_here
JWT_SECRET_KEY=your_secret_key_here
```

### 2. Pre-commit Hook
```bash
# .git/hooks/pre-commit
#!/bin/sh
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "ERROR: Attempting to commit .env file!"
    exit 1
fi
```

### 3. Sử dụng Azure Key Vault / AWS Secrets Manager
- Lưu secrets trong cloud
- Không commit vào Git

---

## 📊 ĐÁNH GIÁ RỦI RO

### Mức độ nghiêm trọng: 🔴 CAO

**Rủi ro:**
- ✅ Kẻ tấn công có thể gửi email từ tài khoản của bạn
- ✅ Spam, phishing campaigns
- ✅ Truy cập Gmail account (nếu 2FA không bật)

**Giảm thiểu:**
- ✅ Thu hồi password NGAY
- ✅ Bật 2FA cho Gmail
- ✅ Monitor Gmail activity

---

## 🆘 HỖ TRỢ

**Cần giúp đỡ?**
1. Google Security: https://myaccount.google.com/security
2. GitHub Security: https://github.com/settings/security
3. GitGuardian Docs: https://docs.gitguardian.com/

---

## ✅ SAU KHI HOÀN THÀNH

Verify:
```bash
# 1. Check .env không trong Git
git ls-files | grep .env
# Kết quả: KHÔNG có gì

# 2. Check .gitignore
cat .gitignore | grep .env
# Kết quả: Có .env

# 3. Check history
git log --all --full-history -- .env
# Kết quả: KHÔNG có gì (nếu đã xóa)
```

---

**THỰC HIỆN NGAY!** ⏰

File này được tạo: 2025-11-21 10:51
